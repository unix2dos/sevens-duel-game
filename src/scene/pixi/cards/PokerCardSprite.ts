import { Container, Graphics, Sprite, Ticker } from "pixi.js";

import { cardMetrics, cardTheme } from "./cardTheme";
import { suitInk } from "./cardGlyphs";
import { getCardFaceTexture } from "./cardSvg";
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
  width,
}: PokerCardSpriteOptions) {
  const root = new Container();
  const glow = new Graphics();
  const shadow = new Graphics();
  const sprite = new Sprite(getCardFaceTexture(card));

  glow.roundRect(0, 0, width, height, cardMetrics.radius + 6).fill({
    alpha: isLegal ? 0.35 : 0.12,
    color: suitInk(card) === "warm" ? cardTheme.glowWarm : cardTheme.glowLegal,
  });
  shadow.roundRect(0, 0, width, height, cardMetrics.radius).fill({
    alpha: cardMetrics.shadowAlpha,
    color: cardTheme.shadow,
  });
  shadow.position.y = cardMetrics.shadowOffsetY;
  sprite.width = width;
  sprite.height = height;
  root.addChild(glow, shadow, sprite);

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
    sprite.y += slideOffset;
    shadow.y += slideOffset;
    glow.y += slideOffset;
    root.alpha = 0;

    const animateIn = () => {
      sprite.y += (0 - sprite.y) * 0.2;
      shadow.y += (cardMetrics.shadowOffsetY - shadow.y) * 0.2;
      glow.y += (0 - glow.y) * 0.2;

      if (root.alpha < targetRootAlpha) {
        root.alpha += (targetRootAlpha - root.alpha) * 0.15;
      }

      if (Math.abs(sprite.y) < 0.5) {
        sprite.y = 0;
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

  if (isInteractive) {
    let hovered = false;
    let targetY = 0;

    root.eventMode = "static";
    root.cursor = "pointer";
    root.on("pointertap", () => onPress?.(card.id));
    
    root.on("pointerover", () => {
      hovered = true;
      targetY = -18; // Elevate card higher 
      glow.alpha = isLegal ? 0.6 : 0.25; // Much brighter hover glow
    });

    root.on("pointerout", () => {
      hovered = false;
      targetY = 0;
      glow.alpha = isLegal ? 0.35 : 0.12;
    });

    const updateHover = () => {
      if (Math.abs(sprite.y - targetY) > 0.1) {
        sprite.y += (targetY - sprite.y) * 0.25; // Faster spring
        glow.y += (targetY - glow.y) * 0.25;
        
        const targetShadowY = cardMetrics.shadowOffsetY + (targetY * -0.4);
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
