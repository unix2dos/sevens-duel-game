import { Container, Graphics, Sprite, Ticker } from "pixi.js";

import { cardMetrics, cardTheme } from "./cardTheme";
import { suitInk } from "./cardGlyphs";
import { getCardBackTexture, getCardFaceTexture } from "./cardSvg";
import type { Actor } from "../../../game/core/state";
import type { Card } from "../../../game/core/types";

interface PokerCardSpriteOptions {
  card: Card;
  height: number;
  isInteractive: boolean;
  isLegal: boolean;
  onPress?: (cardId: string) => void;
  animateEntrance?: boolean;
  owner?: Actor;
  replayFlip?: boolean;
  flipDelay?: number;
  flipStartTime?: number; // Absolute timestamp when the celebration started
  width: number;
}

export function createPokerCardSprite({
  card,
  height,
  isInteractive,
  isLegal,
  onPress,
  animateEntrance = true,
  owner,
  replayFlip = false,
  flipDelay = 0,
  flipStartTime = 0,
  width,
}: PokerCardSpriteOptions) {
  const root = new Container();
  const glow = new Graphics();
  const shadow = new Graphics();
  const cardSurface = new Container();
  const faceSprite = new Sprite(getCardFaceTexture(card));
  const backSprite = new Sprite(getCardBackTexture());
  const baseSurfaceY = height / 2;

  glow.roundRect(0, 0, width, height, cardMetrics.radius + 6).fill({
    alpha: isLegal ? 0.35 : 0.12,
    color: suitInk(card) === "warm" ? cardTheme.glowWarm : cardTheme.glowLegal,
  });
  shadow.roundRect(0, 0, width, height, cardMetrics.radius).fill({
    alpha: cardMetrics.shadowAlpha,
    color: cardTheme.shadow,
  });
  shadow.position.y = cardMetrics.shadowOffsetY;
  cardSurface.pivot.set(width / 2, height / 2);
  cardSurface.position.set(width / 2, baseSurfaceY);
  faceSprite.anchor.set(0.5);
  faceSprite.position.set(width / 2, height / 2);
  faceSprite.width = width;
  faceSprite.height = height;
  backSprite.anchor.set(0.5);
  backSprite.position.set(width / 2, height / 2);
  backSprite.width = width;
  backSprite.height = height;
  
  const FLIP_DURATION = 800; // ms per card
  const isFlipResolved = replayFlip && flipStartTime > 0 && Date.now() > flipStartTime + flipDelay + FLIP_DURATION;
  const isFlipStarted = replayFlip && flipStartTime > 0 && Date.now() >= flipStartTime + flipDelay;
  
  if (replayFlip) {
    if (isFlipResolved) {
      // Animation completely finished
      backSprite.visible = true;
      faceSprite.visible = false;
    } else if (isFlipStarted) {
      // We are *currently* mid-animation, or just about to start.
      // We set the initial state to face-up, and let the ticker catch up the scale.
      backSprite.visible = false;
      faceSprite.visible = true;
    } else {
      // Animation hasn't started yet (still in delay phase).
      backSprite.visible = false;
      faceSprite.visible = true;
    }
  } else {
    backSprite.visible = false;
  }
  
  cardSurface.addChild(backSprite, faceSprite);
  root.addChild(glow, shadow, cardSurface);

  if (owner) {
    const badge = new Graphics();
    const badgeColor = owner === "player" ? 0x3b82f6 : 0xef4444;
    
    badge
      .circle(width - 14, 14, 4.5)
      .fill({ color: badgeColor, alpha: 0.95 })
      .stroke({ color: 0xffffff, alpha: 0.9, width: 1.5 });
      
    root.addChild(badge);
  }

  if (!isLegal) {
    root.alpha = 0.94;
  }

  const targetRootAlpha = isLegal ? 1 : 0.94;

  if (animateEntrance) {
    // Entrance micro-animation
    const slideOffset = 15;
    cardSurface.y += slideOffset;
    shadow.y += slideOffset;
    glow.y += slideOffset;
    root.alpha = 0;

    const animateIn = () => {
      cardSurface.y += (baseSurfaceY - cardSurface.y) * 0.2;
      shadow.y += (cardMetrics.shadowOffsetY - shadow.y) * 0.2;
      glow.y += (0 - glow.y) * 0.2;

      if (root.alpha < targetRootAlpha) {
        root.alpha += (targetRootAlpha - root.alpha) * 0.15;
      }

      if (Math.abs(cardSurface.y - baseSurfaceY) < 0.5) {
        cardSurface.y = baseSurfaceY;
        shadow.y = cardMetrics.shadowOffsetY;
        glow.y = 0;
        root.alpha = targetRootAlpha;
        Ticker.shared.remove(animateIn);
      }
    };

    Ticker.shared.add(animateIn);
    root.on("destroyed", () => Ticker.shared.remove(animateIn));
  } else {
    root.alpha = targetRootAlpha;
  }

  if (replayFlip && !isFlipResolved) {
    const minScale = 0.08;
    const shrinkDuration = FLIP_DURATION * 0.45; // 45% of time shrinking
    const targetTime = flipStartTime + flipDelay;

    const animateFlip = () => {
      const now = Date.now();
      
      // If animation hasn't started yet, do nothing (keep looking like face)
      if (now < targetTime) {
        cardSurface.scale.x = 1;
        return;
      }
      
      const elapsedSinceStart = now - targetTime;
      
      if (elapsedSinceStart >= FLIP_DURATION) {
        // Animation is completely done
        cardSurface.scale.x = 1;
        faceSprite.visible = false;
        backSprite.visible = true;
        Ticker.shared.remove(animateFlip);
        return;
      }
      
      if (elapsedSinceStart < shrinkDuration) {
        // Phase 1: Shrinking face
        const progress = elapsedSinceStart / shrinkDuration;
        // Ease out quadratic (faster start, slower end)
        cardSurface.scale.x = Math.max(minScale, 1 - progress);
        faceSprite.visible = true;
        backSprite.visible = false;
      } else {
        // Phase 2: Expanding back
        const expandProgress = (elapsedSinceStart - shrinkDuration) / (FLIP_DURATION - shrinkDuration);
        // Ease in quadratic
        cardSurface.scale.x = Math.max(minScale, expandProgress);
        faceSprite.visible = false;
        backSprite.visible = true;
      }
    };
    
    Ticker.shared.add(animateFlip);
    root.on("destroyed", () => Ticker.shared.remove(animateFlip));
  }

  if (isInteractive) {
    let hovered = false;
    let targetY = baseSurfaceY;

    root.eventMode = "static";
    root.cursor = "pointer";
    root.on("pointertap", () => onPress?.(card.id));
    
    root.on("pointerover", () => {
      hovered = true;
      targetY = baseSurfaceY - 18; // Elevate card higher 
      glow.alpha = isLegal ? 0.6 : 0.25; // Much brighter hover glow
    });

    root.on("pointerout", () => {
      hovered = false;
      targetY = baseSurfaceY;
      glow.alpha = isLegal ? 0.35 : 0.12;
    });

    const updateHover = () => {
      if (Math.abs(cardSurface.y - targetY) > 0.1) {
        cardSurface.y += (targetY - cardSurface.y) * 0.25; // Faster spring
        glow.y += (targetY - glow.y) * 0.25;
        
        const targetShadowY = cardMetrics.shadowOffsetY + ((targetY - baseSurfaceY) * -0.4);
        shadow.y += (targetShadowY - shadow.y) * 0.25;

        const targetShadowAlpha = cardMetrics.shadowAlpha + (hovered ? -0.15 : 0);
        shadow.alpha += (targetShadowAlpha - shadow.alpha) * 0.25;
      }
    };

    Ticker.shared.add(updateHover);
    root.on("destroyed", () => Ticker.shared.remove(updateHover));
  }

  return root;
}
