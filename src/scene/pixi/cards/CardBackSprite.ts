import { Container, Graphics, Text } from "pixi.js";

import { cardMetrics, cardTheme } from "./cardTheme";

interface CardBackSpriteOptions {
  height: number;
  width: number;
}

export function createCardBackSprite({ height, width }: CardBackSpriteOptions) {
  const root = new Container();
  const shadow = new Graphics();
  const body = new Graphics();
  const inner = new Graphics();
  const band = new Graphics();
  const crest = new Text({
    style: {
      fill: cardTheme.backAccent,
      fontFamily: "Sora, IBM Plex Sans, sans-serif",
      fontSize: Math.max(14, width * 0.22),
      fontWeight: "800",
      letterSpacing: 2,
    },
    text: "VII",
  });
  const label = new Text({
    style: {
      fill: cardTheme.textMuted,
      fontFamily: "IBM Plex Sans, sans-serif",
      fontSize: Math.max(8, width * 0.08),
      fontWeight: "600",
      letterSpacing: 1.5,
    },
    text: "SEVENS",
  });

  shadow.roundRect(0, 0, width, height, cardMetrics.radius).fill({
    alpha: cardMetrics.shadowAlpha,
    color: cardTheme.shadow,
  });
  shadow.position.y = cardMetrics.shadowOffsetY;
  body
    .roundRect(0, 0, width, height, cardMetrics.radius)
    .fill(cardTheme.backBase)
    .stroke({ color: cardTheme.backAccent, width: 1.1, alpha: 0.6 });
  inner
    .roundRect(6, 6, width - 12, height - 12, cardMetrics.radius - 4)
    .fill(cardTheme.backSecondary)
    .stroke({ color: cardTheme.lineStrong, width: 1, alpha: 0.55 });
  band
    .roundRect(10, height / 2 - 8, width - 20, 16, 999)
    .fill(cardTheme.backBase)
    .stroke({ color: cardTheme.backAccent, width: 1, alpha: 0.55 });

  crest.anchor.set(0.5);
  crest.position.set(width / 2, height * 0.44);
  label.anchor.set(0.5);
  label.position.set(width / 2, height * 0.57);

  root.addChild(shadow, body, inner, band, crest, label);

  return root;
}
