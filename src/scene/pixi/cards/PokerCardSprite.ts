import { Container, Graphics, Sprite, Ticker } from "pixi.js";

// Animation to show a card being rejected
export function playShakeAnimation(target: Container) {
  const DURATION = 20; // very fast (~0.33s)
  const shakeAmount = 8;
  const originalX = target.x;

  let time = 0;
  const animateShake = (ticker: Ticker) => {
    time += ticker.deltaTime;

    if (time < DURATION) {
      // Fast sine wave shake left and right
      target.x = originalX + Math.sin(time * 1.5) * shakeAmount * (1 - time / DURATION);
    } else {
      target.x = originalX;
      Ticker.shared.remove(animateShake);
    }
  };

  Ticker.shared.add(animateShake);
  const _destroy = target.destroy;
  target.destroy = function(options) {
    Ticker.shared.remove(animateShake);
    if (_destroy) _destroy.call(this, options);
  };
}

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
  isSelected?: boolean;
  isLegal: boolean;
  onPress?: (cardId: string) => void;
  animateEntrance?: boolean;
  owner?: Actor;
  replayFlip?: boolean;
  flipDelay?: number;
  flipStartTime?: number; // Absolute timestamp when the celebration started
  faceVariant?: CardFaceVariant;
  width: number;
  lastPlayedActor?: Actor;
}

export function createPokerCardSprite({
  card,
  height,
  isInteractive,
  isSelected = false,
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

  const isOpeningHint = isLegal && card.rank === 7;

  glow.roundRect(0, 0, width, height, cardMetrics.radius + 6).fill({
    alpha: isOpeningHint ? 0.6 : (isLegal ? 0.35 : 0.12),
    color: isOpeningHint ? 0xffd700 : (suitInk(card) === "warm" ? cardTheme.glowWarm : cardTheme.glowLegal),
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
    faceSprite.visible = false;
    backSprite.visible = true;
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
    root.alpha = 0.94; // Keep the slight transparent dimming for illegal cards
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
    const _destroyIn = root.destroy;
    root.destroy = function(options) {
      Ticker.shared.remove(animateIn);
      if (_destroyIn) _destroyIn.call(this, options);
    };
  } else {
    root.alpha = targetRootAlpha;
  }

  if (replayFlip && !isFlipResolved) {
    const minScale = 0.08;
    const targetTime = flipStartTime + flipDelay;
    const phaseDuration = CARD_FLIP_DURATION_MS / 2;

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
        faceSprite.visible = false;
        backSprite.visible = true;
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

      const progress = (elapsedSinceStart - phaseDuration) / phaseDuration;
      faceSprite.visible = false;
      backSprite.visible = true;
      cardSurface.scale.x = Math.max(minScale, progress);
    };

    Ticker.shared.add(animateFlip);
    const _destroyFlip = root.destroy;
    root.destroy = function(options) {
      Ticker.shared.remove(animateFlip);
      if (_destroyFlip) _destroyFlip.call(this, options);
    };
  }

  if (isInteractive) {
    root.eventMode = "static";
    root.cursor = "pointer";
    root.on("pointertap", () => onPress?.(card.id));
  }

  // Base lift for ALL selected cards (so you can pull out invalid cards to look at them)
  if (isSelected) {
     cardSurface.scale.set(1.02);
     glow.scale.set(1.01);
     shadow.scale.set(1.0);
     shadow.alpha = cardMetrics.shadowAlpha - 0.1;
     shadow.y = cardMetrics.shadowOffsetY + 8;
  }

  // Premium Magnetic Levitation Effect - ONLY FOR LEGAL CARDS
  if (isSelected && isLegal) {
    let time = 0;
    const updateSelectedEffect = (ticker: Ticker) => {
      time += ticker.deltaTime * 0.08; // Smooth, rhythmic breathing
      const breathe = (Math.sin(time) + 1) / 2; // 0 to 1
      
      // Crisp, luxurious gold edge glow (no messy particles)
      glow.alpha = 0.5 + breathe * 0.4; // 0.5 to 0.9
      glow.tint = 0xebd383; // Soft, premium champagne gold
      
      // Magnetic levitation physics
      const scaleAdd = breathe * 0.03; 
      cardSurface.scale.set(1.02 + scaleAdd);
      glow.scale.set(1.01 + scaleAdd);
      
      // The shadow deepens and softens as the card lifts higher
      shadow.scale.set(1.0 + scaleAdd * 0.3);
      shadow.alpha = cardMetrics.shadowAlpha - 0.25 + (breathe * 0.1); 
      shadow.y = cardMetrics.shadowOffsetY + 12 + (breathe * 6); 
    };

    Ticker.shared.add(updateSelectedEffect);
    const _destroyEffect = root.destroy;
    root.destroy = function(options) {
      Ticker.shared.remove(updateSelectedEffect);
      if (_destroyEffect) _destroyEffect.call(this, options);
    };
  } else {
    // Reset to base legal/illegal states cleanly
    glow.tint = 0xffffff; // Remove tint
  }


  return root;
}
