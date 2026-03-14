import { createSeededRng } from "./rng";
import type { Card, Hands, Rank, Suit } from "./types";

const suits: Suit[] = ["spades", "hearts", "clubs", "diamonds"];
const ranks: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];

export function buildDeck(): Card[] {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      id: `${suit}-${rank}`,
      suit,
      rank,
    })),
  );
}

export function dealHands(deck: Card[], seed: number): Hands {
  const shuffled = [...deck];
  const random = createSeededRng(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return {
    player: shuffled.slice(0, 26),
    opponent: shuffled.slice(26),
  };
}

export function findHeartThreeOwner(hands: Hands): "player" | "opponent" {
  return hands.player.some((card) => card.id === "hearts-3") ? "player" : "opponent";
}
