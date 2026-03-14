import type { Layout } from "./state";
import type { Card, Rank } from "./types";

const ascendingOrder: Rank[] = [7, 8, 9, 10, "J", "Q", "K", "A"];
const descendingOrder: Rank[] = [7, 6, 5, 4, 3, 2];

function hasNeighbor(ranks: Rank[], order: Rank[], rank: Rank) {
  const rankIndex = order.indexOf(rank);

  if (rankIndex <= 0) {
    return false;
  }

  return ranks.includes(order[rankIndex - 1]);
}

export function canPlayCard(layout: Layout, card: Card): boolean {
  const sameSuitCards = layout.filter((entry) => entry.suit === card.suit);

  if (sameSuitCards.length === 0) {
    return card.rank === 7;
  }

  const ranks = sameSuitCards.map((entry) => entry.rank);

  return hasNeighbor(ranks, ascendingOrder, card.rank) || hasNeighbor(ranks, descendingOrder, card.rank);
}

export function getLegalCards(layout: Layout, hand: Card[]): Card[] {
  return hand.filter((card) => canPlayCard(layout, card));
}
