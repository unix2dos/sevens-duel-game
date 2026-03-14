import { Container, Graphics, Text } from "pixi.js";

import { cyberColors, getGlowAlpha } from "./effects";
import type { Card } from "../../game/core/types";

interface CardViewOptions {
  card: Card;
  isFaceUp: boolean;
  isInteractive: boolean;
  isLegal: boolean;
  onPress?: (cardId: string) => void;
  width: number;
  height: number;
}

function cardLabel(card: Card) {
  return `${card.rank}${card.suit === "spades" ? "♠" : card.suit === "hearts" ? "♥" : card.suit === "clubs" ? "♣" : "♦"}`;
}

export function createCardView({
  card,
  isFaceUp,
  isInteractive,
  isLegal,
  onPress,
  width,
  height,
}: CardViewOptions) {
  const root = new Container();
  const glow = new Graphics();
  const shadow = new Graphics();
  const face = new Graphics();
  const suitTint =
    card.suit === "hearts" || card.suit === "diamonds" ? cyberColors.spark : cyberColors.cardInk;

  glow.roundRect(0, 0, width, height, 18).fill({
    alpha: getGlowAlpha(isLegal),
    color: isLegal ? cyberColors.neon : cyberColors.secondary,
  });
  shadow.roundRect(2, 6, width - 4, height - 2, 18).fill({
    alpha: isFaceUp ? 0.26 : 0.34,
    color: 0x01050d,
  });
  face
    .roundRect(4, 4, width - 8, height - 8, 14)
    .fill(isFaceUp ? cyberColors.card : cyberColors.cardBack)
    .stroke({
      color: isFaceUp ? cyberColors.cardEdge : cyberColors.secondary,
      alpha: 0.95,
      width: 1.2,
    });

  root.addChild(glow, shadow, face);

  if (isFaceUp) {
    const corner = new Text({
      style: {
        fill: suitTint,
        fontFamily: "Sora, sans-serif",
        fontSize: Math.max(14, width * 0.2),
        fontWeight: "800",
      },
      text: cardLabel(card),
    });
    const center = new Text({
      style: {
        fill: suitTint,
        fontFamily: "Sora, sans-serif",
        fontSize: Math.max(20, width * 0.3),
        fontWeight: "800",
      },
      text: `${card.rank}`,
    });

    corner.position.set(10, 8);
    center.anchor.set(0.5);
    center.position.set(width / 2, height / 2);
    root.addChild(corner, center);
  } else {
    const band = new Graphics();
    const mark = new Text({
      style: {
        fill: cyberColors.text,
        fontFamily: "Sora, sans-serif",
        fontSize: Math.max(18, width * 0.32),
        fontWeight: "800",
      },
      text: "7",
    });
    const caption = new Text({
      style: {
        fill: cyberColors.muted,
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: Math.max(10, width * 0.12),
        fontWeight: "600",
      },
      text: "排七",
    });

    band
      .roundRect(12, height / 2 - 6, width - 24, 12, 999)
      .fill({ alpha: 0.72, color: cyberColors.track })
      .stroke({ color: cyberColors.neon, alpha: 0.4, width: 1 });
    mark.anchor.set(0.5);
    mark.position.set(width / 2, height / 2 - 12);
    caption.anchor.set(0.5);
    caption.position.set(width / 2, height / 2 + 14);
    root.addChild(band, mark, caption);
  }

  if (isInteractive) {
    root.eventMode = "static";
    root.cursor = "pointer";
    root.on("pointertap", () => onPress?.(card.id));
  }

  return root;
}
