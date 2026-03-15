import { Container, Sprite, Ticker } from "pixi.js";
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

  it("renders a completed replay face-up after the celebration window has elapsed", () => {
    vi.spyOn(Date, "now").mockReturnValue(5_000);

    const root = createPokerCardSprite({
      card: { id: "spades-A", rank: "A", suit: "spades" },
      height: 108,
      isInteractive: false,
      isLegal: false,
      animateEntrance: false,
      replayFlip: true,
      flipDelay: 0,
      flipStartTime: 1_000,
      width: 74,
    });

    const cardSurface = root.children[2] as Container;
    const [backSprite, faceSprite] = cardSurface.children as [Sprite, Sprite];

    expect(faceSprite.visible).toBe(true);
    expect(backSprite.visible).toBe(false);
  });

  it("returns to the face side when a replay flip finishes", () => {
    let animateFlip: (() => void) | undefined;

    vi.spyOn(Date, "now").mockReturnValue(1_000);
    vi.spyOn(Ticker.shared, "add").mockImplementation((listener) => {
      animateFlip = listener as () => void;
      return Ticker.shared;
    });

    const root = createPokerCardSprite({
      card: { id: "spades-A", rank: "A", suit: "spades" },
      height: 108,
      isInteractive: false,
      isLegal: false,
      animateEntrance: false,
      replayFlip: true,
      flipDelay: 0,
      flipStartTime: 1_000,
      width: 74,
    });

    const cardSurface = root.children[2] as Container;
    const [backSprite, faceSprite] = cardSurface.children as [Sprite, Sprite];

    vi.spyOn(Date, "now").mockReturnValue(1_900);
    animateFlip?.();

    expect(cardSurface.scale.x).toBe(1);
    expect(faceSprite.visible).toBe(true);
    expect(backSprite.visible).toBe(false);
  });
});
