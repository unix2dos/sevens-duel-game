import { visualRankValue } from "../game/core/visualRank";
import type { Card, Rank, Suit } from "../game/core/types";

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

const suitOrder: Record<Suit, number> = {
  spades: 0,
  hearts: 1,
  clubs: 2,
  diamonds: 3,
};

function formatRank(rank: Rank) {
  return `${rank}`;
}

export function formatCardCompact(card: Card) {
  return `${formatRank(card.rank)}${suitSymbols[card.suit]}`;
}

export function formatCardFull(card: Card) {
  return `${suitLabels[card.suit]} ${formatRank(card.rank)}`;
}

export function formatCardId(cardId: string) {
  const [suit, rank] = cardId.split("-") as [Suit, string];

  return `${suitLabels[suit]} ${rank}${suitSymbols[suit]}`;
}

export function suitTextLabel(suit: Suit) {
  return suitLabels[suit];
}

export function cardTone(card: Card) {
  return card.suit === "hearts" || card.suit === "diamonds" ? "warm" : "cool";
}

export function sortCardsForDisplay(cards: Card[]) {
  return [...cards].sort((left, right) => {
    if (suitOrder[left.suit] !== suitOrder[right.suit]) {
      return suitOrder[left.suit] - suitOrder[right.suit];
    }

    return visualRankValue[left.rank] - visualRankValue[right.rank];
  });
}
