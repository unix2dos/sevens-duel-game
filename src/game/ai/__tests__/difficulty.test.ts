import { chooseChallengeMove } from "../challenge";
import { chooseChildMove } from "../child";
import type { Observation } from "../types";

const observation: Observation = {
  actor: "opponent",
  hand: [
    { id: "hearts-7", suit: "hearts", rank: 7 },
    { id: "spades-9", suit: "spades", rank: 9 },
  ],
  layout: [],
  legalCards: [{ id: "hearts-7", suit: "hearts", rank: 7 }],
  opponentHandCount: 5,
  phase: "opening",
};

it("child difficulty chooses only from legal moves", () => {
  expect(chooseChildMove(observation, 7)).toEqual(observation.legalCards[0]);
});

it("challenge difficulty does not require access to hidden opponent cards", () => {
  expect(() => chooseChallengeMove(observation, 7)).not.toThrow();
  expect(chooseChallengeMove(observation, 7)).toEqual(observation.legalCards[0]);
});
