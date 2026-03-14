import { scoreNormalMove } from "./heuristics";
import type { Observation } from "./types";

export function chooseNormalMove(observation: Observation, seed: number) {
  if (observation.legalCards.length === 0) {
    return null;
  }

  return [...observation.legalCards].sort(
    (left, right) => scoreNormalMove(observation, right, seed) - scoreNormalMove(observation, left, seed),
  )[0];
}
