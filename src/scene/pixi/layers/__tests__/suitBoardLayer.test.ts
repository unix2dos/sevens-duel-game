import { Container } from "pixi.js";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockCreateCardView } = vi.hoisted(() => ({
  mockCreateCardView: vi.fn(
    ({
      card,
      isFaceUp,
      replayFlip,
      faceVariant,
    }: {
      card: { id: string };
      isFaceUp?: boolean;
      replayFlip?: boolean;
      faceVariant?: string;
    }) => {
      const node = new Container();
      Object.assign(node, {
        __cardId: card.id,
        __faceVariant: faceVariant ?? "standard",
        __isFaceUp: isFaceUp ?? true,
        __replayFlip: replayFlip ?? false,
      });
      return node;
    },
  ),
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

function buildCompleteSuit(suit: "spades" | "hearts" | "clubs" | "diamonds") {
  return [
    { id: `${suit}-A`, suit, rank: "A" as const },
    { id: `${suit}-2`, suit, rank: 2 as const },
    { id: `${suit}-3`, suit, rank: 3 as const },
    { id: `${suit}-4`, suit, rank: 4 as const },
    { id: `${suit}-5`, suit, rank: 5 as const },
    { id: `${suit}-6`, suit, rank: 6 as const },
    { id: `${suit}-7`, suit, rank: 7 as const },
    { id: `${suit}-8`, suit, rank: 8 as const },
    { id: `${suit}-9`, suit, rank: 9 as const },
    { id: `${suit}-10`, suit, rank: 10 as const },
    { id: `${suit}-J`, suit, rank: "J" as const },
    { id: `${suit}-Q`, suit, rank: "Q" as const },
    { id: `${suit}-K`, suit, rank: "K" as const },
  ];
}

afterEach(() => {
  mockCreateCardView.mockClear();
});

describe("createSuitBoardLayer", () => {
  it("marks every card in a completed suit for flip replay", () => {
    const layout = createTableLayout(1280, 860);
    const snapshot: MatchSnapshot = {
      cardOwners: {},
  lastPlayedCards: { player: undefined, opponent: undefined },
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
      celebrationStartTimes: new Map([["spades", 1_000]]),
    } as never);

    const spadeCalls = mockCreateCardView.mock.calls
      .map(([options]) => options as { card: { id: string }; isFaceUp?: boolean; replayFlip?: boolean })
      .filter((options) => options.card.id.startsWith("spades-"));

    expect(spadeCalls).not.toHaveLength(0);
    expect(spadeCalls.every((options) => options.replayFlip === true)).toBe(true);
    expect(spadeCalls.every((options) => options.isFaceUp === true)).toBe(true);
  });

  it("keeps a completed suit face-down after the celebration window ends", () => {
    const layout = createTableLayout(1280, 860);
    const snapshot: MatchSnapshot = {
      cardOwners: {},
  lastPlayedCards: { player: undefined, opponent: undefined },
      difficulty: "normal",
      eventLog: [{ type: "GAME_STARTED", seed: 7 }],
      hands: { player: [], opponent: [] },
      layout: buildCompleteSuit("spades"),
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
    } as never);

    const spadeCalls = mockCreateCardView.mock.calls
      .map(([options]) => options as { card: { id: string }; isFaceUp?: boolean; replayFlip?: boolean })
      .filter((options) => options.card.id.startsWith("spades-"));

    expect(spadeCalls).toHaveLength(13);
    expect(spadeCalls.every((options) => options.replayFlip === false)).toBe(true);
    expect(spadeCalls.every((options) => options.isFaceUp === false)).toBe(true);
  });

  it("renders ace above two on the low-card side", () => {
    const layout = createTableLayout(1280, 860);
    const snapshot: MatchSnapshot = {
      cardOwners: {},
  lastPlayedCards: { player: undefined, opponent: undefined },
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

  it("renders a suit-emblem placeholder before the real seven is played", () => {
    const layout = createTableLayout(1280, 860);
    const snapshot: MatchSnapshot = {
      cardOwners: {},
  lastPlayedCards: { player: undefined, opponent: undefined },
      difficulty: "normal",
      eventLog: [{ type: "GAME_STARTED", seed: 7 }],
      hands: { player: [], opponent: [] },
      layout: [],
      phase: "playing",
      rngState: 7,
      seed: 7,
      status: "playing",
      turn: "player",
    };

    createSuitBoardLayer({ layout, snapshot, seenCards: new Set() });

    const placeholderCall = mockCreateCardView.mock.calls
      .map(([options]) => options as { card: { id: string }; faceVariant?: string })
      .find((options) => options.card.id === "seed-spades-7");

    expect(placeholderCall?.faceVariant).toBe("suit-emblem");
  });

  it("renders the real seven in the center once it is on the board", () => {
    const layout = createTableLayout(1280, 860);
    const snapshot: MatchSnapshot = {
      cardOwners: {},
  lastPlayedCards: { player: undefined, opponent: undefined },
      difficulty: "normal",
      eventLog: [{ type: "GAME_STARTED", seed: 7 }],
      hands: { player: [], opponent: [] },
      layout: [
        { id: "spades-7", suit: "spades", rank: 7 },
        { id: "spades-8", suit: "spades", rank: 8 },
      ],
      phase: "playing",
      rngState: 7,
      seed: 7,
      status: "playing",
      turn: "player",
    };

    createSuitBoardLayer({ layout, snapshot, seenCards: new Set() });

    const regularCall = mockCreateCardView.mock.calls
      .map(([options]) => options as { card: { id: string }; faceVariant?: string })
      .find((options) => options.card.id === "spades-8");
    const centerCall = mockCreateCardView.mock.calls
      .map(([options]) => options as { card: { id: string }; faceVariant?: string })
      .find((options) => options.card.id === "spades-7");
    const placeholderCall = mockCreateCardView.mock.calls
      .map(([options]) => options as { card: { id: string }; faceVariant?: string })
      .find((options) => options.card.id === "seed-spades-7");

    expect(centerCall?.faceVariant).toBeUndefined();
    expect(regularCall?.faceVariant).toBeUndefined();
    expect(placeholderCall).toBeUndefined();
  });
});
