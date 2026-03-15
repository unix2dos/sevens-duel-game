import { describe, expect, it } from "vitest";

import {
  SUIT_CELEBRATION_DURATION_MS,
  getNewlyCompletedSuits,
  updateSuitCelebrations,
} from "../suitCelebration";
import type { Card, Suit } from "../../../game/core/types";

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

describe("updateSuitCelebrations", () => {
  it("keeps a newly completed suit active until the full celebration window ends", () => {
    const previous = buildSuit("spades", [7, 8, 9, 10, "J", "Q", "K", 6, 5, 4, 3, 2]);
    const complete = buildSuit("spades", [7, 8, 9, 10, "J", "Q", "K", 6, 5, 4, 3, 2, "A"]);
    const active = new Map<Suit, number>();

    const started = updateSuitCelebrations(active, previous, complete, 1_000);
    const continued = updateSuitCelebrations(started, complete, complete, 1_400);

    expect(started).toEqual(new Map([["spades", 1_000]]));
    expect(continued).toEqual(new Map([["spades", 1_000]]));
  });

  it("drops a finished celebration after the full flip window", () => {
    const complete = buildSuit("spades", [7, 8, 9, 10, "J", "Q", "K", 6, 5, 4, 3, 2, "A"]);
    const active = new Map<Suit, number>([["spades", 1_000]]);

    const next = updateSuitCelebrations(
      active,
      complete,
      complete,
      1_000 + SUIT_CELEBRATION_DURATION_MS + 1,
    );

    expect(next).toEqual(new Map());
  });
});
