import { scoreChallengeMove } from "./heuristics";
import type { Observation } from "./types";

export function chooseChallengeMove(observation: Observation, seed: number) {
  if (observation.legalCards.length === 0) {
    return null;
  }

  return [...observation.legalCards].sort(
    (left, right) => scoreChallengeMove(observation, right, seed) - scoreChallengeMove(observation, left, seed),
  )[0];
}
