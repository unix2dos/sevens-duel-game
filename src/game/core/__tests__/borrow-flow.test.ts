import { applyBorrowWhenStuck, applyGiveCard, createInitialGameState } from "../reducer";

it("borrows exactly one card during opening when the starter has no seven", () => {
  const state = createInitialGameState({
    playerCards: ["hearts-3", "clubs-2"],
    opponentCards: ["spades-7", "diamonds-4"],
    seed: 7,
  });

  const next = applyBorrowWhenStuck(state);

  expect(next.eventLog.some((event) => event.type === "CARD_BORROWED")).toBe(true);
  expect(next.hands.player.length + next.hands.opponent.length + next.layout.length).toBe(4);
});

it("keeps a newly borrowed legal card in the player's hand until they choose to play it", () => {
  const state = createInitialGameState({
    playerCards: ["hearts-3"],
    opponentCards: ["spades-7", "clubs-7"],
    seed: 3,
  });

  const next = applyBorrowWhenStuck(state);

  expect(next.turn).toBe("player");
  expect(next.layout).toHaveLength(0);
  expect(next.hands.player.map((card) => card.id)).toContain("spades-7");
  expect(next.eventLog.map((event) => event.type)).toEqual(["GAME_STARTED", "CARD_BORROWED"]);
  expect(next.phase).toBe("opening");
});

it("lets the opponent decide a borrowed legal card on their next action instead of auto-playing it", () => {
  const state = createInitialGameState({
    playerCards: ["spades-7", "hearts-9"],
    opponentCards: ["clubs-2"],
    seed: 1,
    turn: "opponent",
    phase: "playing",
    layout: ["clubs-7"],
  });

  const borrowing = applyBorrowWhenStuck(state);
  const next = applyGiveCard(borrowing, "spades-7");

  expect(next.turn).toBe("opponent");
  expect(next.layout).toHaveLength(1);
  expect(next.hands.opponent.map((card) => card.id)).toContain("spades-7");
  expect(next.eventLog.map((event) => event.type)).toEqual(["GAME_STARTED", "CARD_BORROWED"]);
  expect(next.phase).toBe("playing");
});

it("awards the win to the player whose hand reaches zero after they borrow away the last opponent card", () => {
  const state = createInitialGameState({
    playerCards: ["hearts-3"],
    opponentCards: ["spades-7"],
    seed: 1,
  });

  const next = applyBorrowWhenStuck(state);

  expect(next.status).toBe("finished");
  expect(next.winner).toBe("opponent");
});

it("awards the win to the player whose hand reaches zero after the AI borrows their last card", () => {
  const state = createInitialGameState({
    playerCards: ["spades-7"],
    opponentCards: ["hearts-3"],
    seed: 1,
    turn: "opponent",
    phase: "playing",
    layout: ["clubs-7"],
  });

  const borrowing = applyBorrowWhenStuck(state);

  expect(borrowing.phase).toBe("borrowing");
  expect(borrowing.borrowRequester).toBe("opponent");

  const next = applyGiveCard(borrowing, "spades-7");

  expect(next.status).toBe("finished");
  expect(next.winner).toBe("player");
});
