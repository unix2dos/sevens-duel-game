import type { Card, Suit } from "../../game/core/types";

export const CARD_FLIP_DURATION_MS = 800;
export const CARD_FLIP_DELAY_STEP_MS = 120;
const MAX_FLIP_DISTANCE = 6;
export const SUIT_CELEBRATION_DURATION_MS =
  CARD_FLIP_DURATION_MS + CARD_FLIP_DELAY_STEP_MS * MAX_FLIP_DISTANCE;

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

export function updateSuitCelebrations(
  activeCelebrations: Map<Suit, number>,
  previousLayout: Card[] | null,
  nextLayout: Card[],
  now: number,
) {
  const nextCelebrations = new Map<Suit, number>();

  activeCelebrations.forEach((startedAt, suit) => {
    if (now - startedAt <= SUIT_CELEBRATION_DURATION_MS) {
      nextCelebrations.set(suit, startedAt);
    }
  });

  getNewlyCompletedSuits(previousLayout, nextLayout).forEach((suit) => {
    nextCelebrations.set(suit, now);
  });

  return nextCelebrations;
}
