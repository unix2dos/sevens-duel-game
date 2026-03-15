import type { Card, Suit } from "../../game/core/types";

function countSuitCards(layout: Card[]) {
  const counts = new Map<Suit, number>();

  layout.forEach((card) => {
    counts.set(card.suit, (counts.get(card.suit) ?? 0) + 1);
  });

  return counts;
}

export function getNewlyCompletedSuits(previousLayout: Card[] | null, nextLayout: Card[]) {
  if (!previousLayout) {
    return new Set<Suit>();
  }

  const previousCounts = countSuitCards(previousLayout);
  const nextCounts = countSuitCards(nextLayout);
  const completed = new Set<Suit>();

  nextCounts.forEach((count, suit) => {
    if ((previousCounts.get(suit) ?? 0) < 13 && count === 13) {
      completed.add(suit);
    }
  });

  return completed;
}
