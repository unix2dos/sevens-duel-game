import { Container, Graphics, Sprite, Ticker } from "pixi.js";

import { cardMetrics, cardTheme } from "./cardTheme";
import type { CardFaceVariant } from "./cardSvg";
import { suitInk } from "./cardGlyphs";
import { getCardBackTexture, getCardFaceTexture } from "./cardSvg";
import { CARD_FLIP_DURATION_MS } from "../suitCelebration";
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
  faceVariant?: CardFaceVariant;
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
  faceVariant = "standard",
  width,
}: PokerCardSpriteOptions) {
  const root = new Container();
  const glow = new Graphics();
  const shadow = new Graphics();
  const cardSurface = new Container();
  const faceSprite = new Sprite(getCardFaceTexture(card, faceVariant));
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
  faceSprite.visible = true;
  backSprite.anchor.set(0.5);
  backSprite.position.set(width / 2, height / 2);
  backSprite.width = width;
  backSprite.height = height;
  backSprite.visible = false;

  const isFlipResolved =
    replayFlip &&
    flipStartTime > 0 &&
    Date.now() > flipStartTime + flipDelay + CARD_FLIP_DURATION_MS;

  if (isFlipResolved) {
    cardSurface.scale.x = 1;
    faceSprite.visible = true;
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
    const targetTime = flipStartTime + flipDelay;
    const phaseDuration = CARD_FLIP_DURATION_MS / 4;

    const animateFlip = () => {
      const now = Date.now();

      if (now < targetTime) {
        cardSurface.scale.x = 1;
        faceSprite.visible = true;
        backSprite.visible = false;
        return;
      }

      const elapsedSinceStart = now - targetTime;

      if (elapsedSinceStart >= CARD_FLIP_DURATION_MS) {
        cardSurface.scale.x = 1;
        faceSprite.visible = true;
        backSprite.visible = false;
        Ticker.shared.remove(animateFlip);
        return;
      }

      if (elapsedSinceStart < phaseDuration) {
        const progress = elapsedSinceStart / phaseDuration;
        faceSprite.visible = true;
        backSprite.visible = false;
        cardSurface.scale.x = Math.max(minScale, 1 - progress);
        return;
      }

      if (elapsedSinceStart < phaseDuration * 2) {
        const progress = (elapsedSinceStart - phaseDuration) / phaseDuration;
        faceSprite.visible = false;
        backSprite.visible = true;
        cardSurface.scale.x = Math.max(minScale, progress);
        return;
      }

      if (elapsedSinceStart < phaseDuration * 3) {
        const progress = (elapsedSinceStart - phaseDuration * 2) / phaseDuration;
        faceSprite.visible = false;
        backSprite.visible = true;
        cardSurface.scale.x = Math.max(minScale, 1 - progress);
        return;
      }

      const progress = (elapsedSinceStart - phaseDuration * 3) / phaseDuration;
      faceSprite.visible = true;
      backSprite.visible = false;
      cardSurface.scale.x = Math.max(minScale, progress);
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
