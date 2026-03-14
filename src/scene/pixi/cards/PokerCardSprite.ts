import { Container, Graphics, Text } from "pixi.js";

import { cardMetrics, cardTheme } from "./cardTheme";
import { cardName, isFaceRank, pipLayout, rankText, suitInk, suitSymbol } from "./cardGlyphs";
import type { Card } from "../../../game/core/types";

interface PokerCardSpriteOptions {
  card: Card;
  height: number;
  isInteractive: boolean;
  isLegal: boolean;
  onPress?: (cardId: string) => void;
  width: number;
}

function inkColor(card: Card) {
  return suitInk(card) === "warm" ? cardTheme.inkWarm : cardTheme.inkDark;
}

function addCornerMarks(root: Container, card: Card, width: number, height: number) {
  const color = inkColor(card);
  const topRank = new Text({
    style: {
      fill: color,
      fontFamily: "Sora, IBM Plex Sans, sans-serif",
      fontSize: Math.max(16, width * 0.19),
      fontWeight: "800",
    },
    text: rankText(card.rank),
  });
  const topSuit = new Text({
    style: {
      fill: color,
      fontFamily: "Georgia, serif",
      fontSize: Math.max(14, width * 0.16),
      fontWeight: "700",
    },
    text: suitSymbol(card.suit),
  });
  const bottomCorner = new Container();
  const bottomRank = new Text({
    style: {
      fill: color,
      fontFamily: "Sora, IBM Plex Sans, sans-serif",
      fontSize: Math.max(16, width * 0.19),
      fontWeight: "800",
    },
    text: rankText(card.rank),
  });
  const bottomSuit = new Text({
    style: {
      fill: color,
      fontFamily: "Georgia, serif",
      fontSize: Math.max(14, width * 0.16),
      fontWeight: "700",
    },
    text: suitSymbol(card.suit),
  });

  topRank.position.set(10, 8);
  topSuit.position.set(11, 24);

  bottomRank.position.set(0, 0);
  bottomSuit.position.set(1, 16);
  bottomCorner.addChild(bottomRank, bottomSuit);
  bottomCorner.pivot.set(bottomCorner.width / 2, bottomCorner.height / 2);
  bottomCorner.position.set(width - 16, height - 18);
  bottomCorner.rotation = Math.PI;

  root.addChild(topRank, topSuit, bottomCorner);
}

function addPips(root: Container, card: Card, width: number, height: number) {
  const color = inkColor(card);
  const pips = pipLayout(card.rank);

  if (pips.length > 0) {
    pips.forEach((point) => {
      const pip = new Text({
        style: {
          fill: color,
          fontFamily: "Georgia, serif",
          fontSize: Math.max(18, width * 0.18),
          fontWeight: "700",
        },
        text: suitSymbol(card.suit),
      });

      pip.anchor.set(0.5);
      pip.position.set(width * point.x, height * point.y);

      if (point.rotate) {
        pip.rotation = Math.PI;
      }

      root.addChild(pip);
    });

    return;
  }

  const center = new Container();
  const monogram = new Text({
    style: {
      fill: color,
      fontFamily: "Sora, IBM Plex Sans, sans-serif",
      fontSize: Math.max(28, width * 0.34),
      fontWeight: "800",
    },
    text: rankText(card.rank),
  });
  const emblem = new Text({
    style: {
      fill: color,
      fontFamily: "Georgia, serif",
      fontSize: Math.max(24, width * 0.28),
      fontWeight: "700",
    },
    text: suitSymbol(card.suit),
  });
  const caption = new Text({
    style: {
      fill: color,
      fontFamily: "IBM Plex Sans, sans-serif",
      fontSize: Math.max(10, width * 0.09),
      fontStyle: "italic",
    },
    text: isFaceRank(card.rank) ? `${cardName(card)}` : "",
  });

  monogram.anchor.set(0.5);
  monogram.position.set(width / 2, height * 0.44);
  emblem.anchor.set(0.5);
  emblem.position.set(width / 2, height * 0.58);
  caption.anchor.set(0.5);
  caption.position.set(width / 2, height * 0.73);
  center.addChild(monogram, emblem, caption);
  root.addChild(center);
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
  const face = new Graphics();
  const bloom = new Graphics();
  const wash = new Graphics();

  glow.roundRect(0, 0, width, height, cardMetrics.radius + 4).fill({
    alpha: isLegal ? 0.22 : 0.08,
    color: suitInk(card) === "warm" ? cardTheme.glowWarm : cardTheme.glowLegal,
  });
  shadow.roundRect(0, 0, width, height, cardMetrics.radius).fill({
    alpha: cardMetrics.shadowAlpha,
    color: cardTheme.shadow,
  });
  shadow.position.y = cardMetrics.shadowOffsetY;
  face
    .roundRect(0, 0, width, height, cardMetrics.radius)
    .fill(cardTheme.paper)
    .stroke({ color: cardTheme.edge, width: 1.25, alpha: 1 });
  bloom.ellipse(width * 0.48, height * 0.28, width * 0.34, height * 0.16).fill({
    alpha: 0.12,
    color: 0xffffff,
  });
  wash.roundRect(8, 10, width - 16, height * 0.42, cardMetrics.radius - 6).fill({
    alpha: 0.05,
    color: 0xffffff,
  });

  const faceInset = new Graphics();
  faceInset
    .roundRect(
      cardMetrics.inset,
      cardMetrics.inset,
      width - cardMetrics.inset * 2,
      height - cardMetrics.inset * 2,
      cardMetrics.radius - 3,
    )
    .stroke({ color: cardTheme.paperShade, width: 1, alpha: 0.6 });

  root.addChild(glow, shadow, face, bloom, wash, faceInset);
  addCornerMarks(root, card, width, height);
  addPips(root, card, width, height);

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
