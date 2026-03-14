import { createMatch, dispatchHumanAction, replayMatch } from "../engine";

it("replays the same deterministic outcome from the same seed and actions", () => {
  const match = createMatch({ seed: 99, difficulty: "normal" });
  const replay = replayMatch(match.snapshot.seed, match.snapshot.eventLog);

  expect(replay.layout).toEqual(match.snapshot.layout);
  expect(replay.turn).toEqual(match.snapshot.turn);
  expect(replay.hands).toEqual(match.snapshot.hands);
});

it("lets the acting player play a legal card through the match engine", () => {
  const match = createMatch({
    seed: 7,
    difficulty: "normal",
    initialHands: {
      player: ["hearts-3", "spades-7"],
      opponent: ["clubs-7", "diamonds-9"],
    },
  });

  const next = dispatchHumanAction(match, { type: "play", cardId: "spades-7" });

  expect(next.snapshot.layout.map((card) => card.id)).toEqual(["spades-7"]);
  expect(next.snapshot.turn).toBe("opponent");
  expect(next.snapshot.phase).toBe("playing");
});

it("ignores illegal player clicks instead of crashing the match", () => {
  const match = createMatch({
    seed: 7,
    difficulty: "normal",
    initialHands: {
      player: ["hearts-3", "spades-K", "clubs-7"],
      opponent: ["diamonds-7", "clubs-9"],
    },
  });

  const next = dispatchHumanAction(match, { type: "play", cardId: "spades-K" });

  expect(next.snapshot).toEqual(match.snapshot);
});
