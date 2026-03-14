import { Container, Graphics, Sprite } from "pixi.js";

import { cardMetrics, cardTheme } from "./cardTheme";
import { suitInk } from "./cardGlyphs";
import { getCardFaceTexture } from "./cardSvg";
import type { Card } from "../../../game/core/types";

interface PokerCardSpriteOptions {
  card: Card;
  height: number;
  isInteractive: boolean;
  isLegal: boolean;
  onPress?: (cardId: string) => void;
  width: number;
}

export function createPokerCardSprite({
  card,
  height,
  isInteractive,
  isLegal,
  onPress,
  width,
}: PokerCardSpriteOptions) {
  const root = new Container();
  const glow = new Graphics();
  const shadow = new Graphics();
  const sprite = new Sprite(getCardFaceTexture(card));

  glow.roundRect(0, 0, width, height, cardMetrics.radius + 4).fill({
    alpha: isLegal ? 0.22 : 0.08,
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

  if (!isLegal) {
    root.alpha = 0.94;
  }

  if (isInteractive) {
    root.eventMode = "static";
    root.cursor = "pointer";
    root.on("pointertap", () => onPress?.(card.id));
  }

  return root;
}
