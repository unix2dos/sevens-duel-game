import { Sprite } from "pixi.js";
import { describe, expect, it } from "vitest";

import { createCardView } from "../../CardView";

function containsSprite(node: unknown): boolean {
  if (node instanceof Sprite) {
    return true;
  }

  if (typeof node === "object" && node && "children" in node) {
    const candidate = node as { children?: unknown[] };
    return candidate.children?.some((child) => containsSprite(child)) ?? false;
  }

  return false;
}

describe("createCardView", () => {
  it("renders face cards with texture-backed sprites instead of only procedural graphics", () => {
    const view = createCardView({
      card: { id: "spades-7", rank: 7, suit: "spades" },
      height: 108,
      isFaceUp: true,
      isInteractive: false,
      isLegal: true,
      width: 74,
    });

    expect(containsSprite(view)).toBe(true);
  });
});
