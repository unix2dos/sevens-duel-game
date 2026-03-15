import { describe, expect, it, vi } from "vitest";

vi.mock("pixi.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("pixi.js")>();

  class MockText extends actual.Container {
    anchor = { set: vi.fn() };
    text: string;

    constructor(options: { text: string }) {
      super();
      this.text = options.text;
    }

    get width() {
      return this.text.length * 8;
    }

    get height() {
      return 16;
    }
  }

  return {
    ...actual,
    Text: MockText,
  };
});

import { Container, Text } from "pixi.js";

const { mockCreateCardView } = vi.hoisted(() => ({
  mockCreateCardView: vi.fn(() => new Container()),
}));

vi.mock("../../CardView", () => ({
  createCardView: mockCreateCardView,
}));

import { createTableLayout } from "../../layout/tableLayout";
import { createPlayerHandLayer } from "../PlayerHandLayer";
import type { MatchSnapshot } from "../../../../game/match/engine";

function findText(node: Container, content: string): Text | undefined {
  return node.children.find(
    (child): child is Text => child instanceof Text && child.text === content,
  );
}

describe("createPlayerHandLayer", () => {
  it("renders a manual borrow chip when the player has no legal move", () => {
    const onBorrow = vi.fn();
    const layout = createTableLayout(1280, 860);
    const snapshot: MatchSnapshot = {
      cardOwners: {},
      difficulty: "normal",
      eventLog: [{ type: "GAME_STARTED", seed: 7 }],
      hands: {
        player: [{ id: "hearts-3", suit: "hearts", rank: 3 }],
        opponent: [{ id: "spades-7", suit: "spades", rank: 7 }],
      },
      layout: [],
      phase: "opening",
      rngState: 7,
      seed: 7,
      status: "playing",
      turn: "player",
    };

    const layer = createPlayerHandLayer({
      layout,
      onBorrow,
      onPlayCard: vi.fn(),
      seenCards: new Set(),
      selectedGiveCardId: null,
      snapshot,
    });
    const borrowChip = layer.children.find(
      (child) => child instanceof Container && findText(child, "无牌可出 · 点击借牌"),
    ) as Container | undefined;

    expect(borrowChip).toBeDefined();
    borrowChip?.emit("pointertap", {} as never);
    expect(onBorrow).toHaveBeenCalledTimes(1);
  });
});
