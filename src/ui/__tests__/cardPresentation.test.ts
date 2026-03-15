import { describe, expect, it } from "vitest";

import { sortCardsForDisplay } from "../cardPresentation";

describe("sortCardsForDisplay", () => {
  it("sorts ace before two so the low-card chain reads consistently", () => {
    const cards = sortCardsForDisplay([
      { id: "spades-2", suit: "spades", rank: 2 },
      { id: "spades-A", suit: "spades", rank: "A" },
      { id: "spades-K", suit: "spades", rank: "K" },
    ]);

    expect(cards.map((card) => card.id)).toEqual(["spades-A", "spades-2", "spades-K"]);
  });
});
