import { applyBorrowWhenStuck, createInitialGameState } from "../reducer";

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

it("plays a borrowed card immediately when it becomes legal", () => {
  const state = createInitialGameState({
    playerCards: ["hearts-3"],
    opponentCards: ["spades-7", "clubs-7"],
    seed: 3,
  });

  const next = applyBorrowWhenStuck(state);

  expect(next.layout).toHaveLength(1);
  expect(next.eventLog.map((event) => event.type)).toEqual(["GAME_STARTED", "CARD_BORROWED", "CARD_PLAYED", "TURN_PASSED"]);
  expect(next.phase).toBe("playing");
});

it("ends the game immediately if the target of a borrow reaches zero cards", () => {
  const state = createInitialGameState({
    playerCards: ["hearts-3"],
    opponentCards: ["spades-7"],
    seed: 1,
  });

  const next = applyBorrowWhenStuck(state);

  expect(next.status).toBe("finished");
  expect(next.winner).toBe("player");
});
