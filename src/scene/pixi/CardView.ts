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
  const face = new Graphics();
  const label = new Text({
    style: {
      fill: isFaceUp ? cyberColors.cardInk : cyberColors.text,
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: Math.max(16, width * 0.23),
      fontWeight: "700",
    },
    text: isFaceUp ? cardLabel(card) : "SEVENS",
  });

  glow.roundRect(0, 0, width, height, 18).fill({
    alpha: getGlowAlpha(isLegal),
    color: isLegal ? cyberColors.neon : cyberColors.secondary,
  });
  face
    .roundRect(4, 4, width - 8, height - 8, 14)
    .fill(isFaceUp ? cyberColors.card : cyberColors.cardBack);

  label.anchor.set(0.5);
  label.position.set(width / 2, height / 2);

  root.addChild(glow, face, label);

  if (isInteractive) {
    root.eventMode = "static";
    root.cursor = "pointer";
    root.on("pointertap", () => onPress?.(card.id));
  }

  return root;
}
