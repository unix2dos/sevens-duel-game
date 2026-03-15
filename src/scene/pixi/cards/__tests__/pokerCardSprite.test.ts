import { Ticker } from "pixi.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createPokerCardSprite } from "../PokerCardSprite";

describe("createPokerCardSprite", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers a ticker animation when replayFlip is requested", () => {
    const addSpy = vi.spyOn(Ticker.shared, "add");

    createPokerCardSprite({
      card: { id: "spades-A", rank: "A", suit: "spades" },
      height: 108,
      isInteractive: false,
      isLegal: false,
      animateEntrance: false,
      replayFlip: true,
      width: 74,
    } as never);

    expect(addSpy).toHaveBeenCalled();
  });
});
