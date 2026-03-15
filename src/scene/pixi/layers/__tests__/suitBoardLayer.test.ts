import { Container } from "pixi.js";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockCreateCardView } = vi.hoisted(() => ({
  mockCreateCardView: vi.fn(({ card, replayFlip }: { card: { id: string }; replayFlip?: boolean }) => {
    const node = new Container();
    Object.assign(node, { __cardId: card.id, __replayFlip: replayFlip ?? false });
    return node;
  }),
}));

vi.mock("../../CardView", () => ({
  createCardView: mockCreateCardView,
}));

import { createTableLayout } from "../../layout/tableLayout";
import { createSuitBoardLayer } from "../SuitBoardLayer";
import type { MatchSnapshot } from "../../../../game/match/engine";

function getCardNode(layer: Container, cardId: string) {
  return layer.children.find((child) => (child as Container & { __cardId?: string }).__cardId === cardId) as Container;
}

afterEach(() => {
  mockCreateCardView.mockClear();
});

describe("createSuitBoardLayer", () => {
  it("marks every card in a completed suit for flip replay", () => {
    const layout = createTableLayout(1280, 860);
    const snapshot: MatchSnapshot = {
      cardOwners: {},
      difficulty: "normal",
      eventLog: [{ type: "GAME_STARTED", seed: 7 }],
      hands: { player: [], opponent: [] },
      layout: [
        { id: "spades-7", suit: "spades", rank: 7 },
        { id: "spades-8", suit: "spades", rank: 8 },
        { id: "spades-6", suit: "spades", rank: 6 },
      ],
      phase: "playing",
      rngState: 7,
      seed: 7,
      status: "playing",
      turn: "player",
    };

    createSuitBoardLayer({
      layout,
      snapshot,
      seenCards: new Set(),
      celebratingSuits: new Set(["spades"]),
    } as never);

    const spadeCalls = mockCreateCardView.mock.calls
      .map(([options]) => options as { card: { id: string }; replayFlip?: boolean })
      .filter((options) => options.card.id.startsWith("spades-"));

    expect(spadeCalls).not.toHaveLength(0);
    expect(spadeCalls.every((options) => options.replayFlip === true)).toBe(true);
  });

  it("renders ace above two on the low-card side", () => {
    const layout = createTableLayout(1280, 860);
    const snapshot: MatchSnapshot = {
      cardOwners: {},
      difficulty: "normal",
      eventLog: [{ type: "GAME_STARTED", seed: 7 }],
      hands: { player: [], opponent: [] },
      layout: [
        { id: "spades-7", suit: "spades", rank: 7 },
        { id: "spades-2", suit: "spades", rank: 2 },
        { id: "spades-A", suit: "spades", rank: "A" },
      ],
      phase: "playing",
      rngState: 7,
      seed: 7,
      status: "playing",
      turn: "player",
    };

    const layer = createSuitBoardLayer({ layout, snapshot, seenCards: new Set() });
    const sevenNode = getCardNode(layer, "spades-7");
    const twoNode = getCardNode(layer, "spades-2");
    const aceNode = getCardNode(layer, "spades-A");

    expect(twoNode.position.y).toBeLessThan(sevenNode.position.y);
    expect(aceNode.position.y).toBeLessThan(twoNode.position.y);
  });
});
