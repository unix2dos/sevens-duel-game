import { Container, Graphics, Sprite } from "pixi.js";

import { cardMetrics, cardTheme } from "./cardTheme";
import { getCardBackTexture } from "./cardSvg";

interface CardBackSpriteOptions {
  height: number;
  width: number;
}

export function createCardBackSprite({ height, width }: CardBackSpriteOptions) {
  const root = new Container();
  const shadow = new Graphics();
  const sprite = new Sprite(getCardBackTexture());

  shadow.roundRect(0, 0, width, height, cardMetrics.radius).fill({
    alpha: cardMetrics.shadowAlpha,
    color: cardTheme.shadow,
  });
  shadow.position.y = cardMetrics.shadowOffsetY;
  sprite.width = width;
  sprite.height = height;
  root.addChild(shadow, sprite);

  return root;
}
