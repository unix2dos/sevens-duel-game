import { describe, expect, it } from "vitest";

import { getNewlyCompletedSuits } from "../suitCelebration";
import type { Card } from "../../../game/core/types";

function buildSuit(suit: Card["suit"], ranks: Card["rank"][]): Card[] {
  return ranks.map((rank) => ({
    id: `${suit}-${rank}`,
    rank,
    suit,
  }));
}

describe("getNewlyCompletedSuits", () => {
  it("returns the suit that just reached all 13 cards", () => {
    const previous = buildSuit("spades", [7, 8, 9, 10, "J", "Q", "K", 6, 5, 4, 3, 2]);
    const next = buildSuit("spades", [7, 8, 9, 10, "J", "Q", "K", 6, 5, 4, 3, 2, "A"]);

    expect(getNewlyCompletedSuits(previous, next)).toEqual(new Set(["spades"]));
  });

  it("returns nothing when a suit was already complete", () => {
    const complete = buildSuit("hearts", [7, 8, 9, 10, "J", "Q", "K", 6, 5, 4, 3, 2, "A"]);

    expect(getNewlyCompletedSuits(complete, complete)).toEqual(new Set());
  });

  it("returns nothing on the first render without previous layout", () => {
    const complete = buildSuit("clubs", [7, 8, 9, 10, "J", "Q", "K", 6, 5, 4, 3, 2, "A"]);

    expect(getNewlyCompletedSuits(null, complete)).toEqual(new Set());
  });
});
