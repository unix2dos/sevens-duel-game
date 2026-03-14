import type { Card, Rank, Suit } from "../../../game/core/types";

export interface PipPoint {
  x: number;
  y: number;
  rotate: boolean;
}

const suitSymbols: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  clubs: "♣",
  diamonds: "♦",
};

const suitLabels: Record<Suit, string> = {
  spades: "黑桃",
  hearts: "红桃",
  clubs: "梅花",
  diamonds: "方块",
};

const suitInks: Record<Suit, "dark" | "warm"> = {
  spades: "dark",
  hearts: "warm",
  clubs: "dark",
  diamonds: "warm",
};

const pipLayouts: Record<number, PipPoint[]> = {
  2: [
    { x: 0.5, y: 0.28, rotate: false },
    { x: 0.5, y: 0.72, rotate: true },
  ],
  3: [
    { x: 0.5, y: 0.24, rotate: false },
    { x: 0.5, y: 0.5, rotate: false },
    { x: 0.5, y: 0.76, rotate: true },
  ],
  4: [
    { x: 0.33, y: 0.28, rotate: false },
    { x: 0.67, y: 0.28, rotate: false },
    { x: 0.33, y: 0.72, rotate: true },
    { x: 0.67, y: 0.72, rotate: true },
  ],
  5: [
    { x: 0.33, y: 0.28, rotate: false },
    { x: 0.67, y: 0.28, rotate: false },
    { x: 0.5, y: 0.5, rotate: false },
    { x: 0.33, y: 0.72, rotate: true },
    { x: 0.67, y: 0.72, rotate: true },
  ],
  6: [
    { x: 0.33, y: 0.24, rotate: false },
    { x: 0.67, y: 0.24, rotate: false },
    { x: 0.33, y: 0.5, rotate: false },
    { x: 0.67, y: 0.5, rotate: false },
    { x: 0.33, y: 0.76, rotate: true },
    { x: 0.67, y: 0.76, rotate: true },
  ],
  7: [
    { x: 0.33, y: 0.22, rotate: false },
    { x: 0.67, y: 0.22, rotate: false },
    { x: 0.5, y: 0.38, rotate: false },
    { x: 0.33, y: 0.54, rotate: false },
    { x: 0.67, y: 0.54, rotate: false },
    { x: 0.33, y: 0.78, rotate: true },
    { x: 0.67, y: 0.78, rotate: true },
  ],
  8: [
    { x: 0.33, y: 0.2, rotate: false },
    { x: 0.67, y: 0.2, rotate: false },
    { x: 0.33, y: 0.38, rotate: false },
    { x: 0.67, y: 0.38, rotate: false },
    { x: 0.33, y: 0.62, rotate: true },
    { x: 0.67, y: 0.62, rotate: true },
    { x: 0.33, y: 0.8, rotate: true },
    { x: 0.67, y: 0.8, rotate: true },
  ],
  9: [
    { x: 0.33, y: 0.18, rotate: false },
    { x: 0.67, y: 0.18, rotate: false },
    { x: 0.33, y: 0.34, rotate: false },
    { x: 0.67, y: 0.34, rotate: false },
    { x: 0.5, y: 0.5, rotate: false },
    { x: 0.33, y: 0.66, rotate: true },
    { x: 0.67, y: 0.66, rotate: true },
    { x: 0.33, y: 0.82, rotate: true },
    { x: 0.67, y: 0.82, rotate: true },
  ],
  10: [
    { x: 0.33, y: 0.16, rotate: false },
    { x: 0.67, y: 0.16, rotate: false },
    { x: 0.33, y: 0.32, rotate: false },
    { x: 0.67, y: 0.32, rotate: false },
    { x: 0.5, y: 0.46, rotate: false },
    { x: 0.33, y: 0.54, rotate: true },
    { x: 0.67, y: 0.54, rotate: true },
    { x: 0.33, y: 0.68, rotate: true },
    { x: 0.67, y: 0.68, rotate: true },
    { x: 0.5, y: 0.84, rotate: true },
  ],
};

export function suitSymbol(suit: Suit) {
  return suitSymbols[suit];
}

export function suitLabel(suit: Suit) {
  return suitLabels[suit];
}

export function suitInk(cardOrSuit: Card | Suit) {
  const suit = typeof cardOrSuit === "string" ? cardOrSuit : cardOrSuit.suit;

  return suitInks[suit];
}

export function rankText(rank: Rank) {
  return `${rank}`;
}

export function cardName(card: Card) {
  return `${suitLabel(card.suit)} ${rankText(card.rank)}`;
}

export function pipLayout(rank: Rank) {
  return typeof rank === "number" ? pipLayouts[rank] ?? [] : [];
}

export function isFaceRank(rank: Rank) {
  return rank === "J" || rank === "Q" || rank === "K";
}
