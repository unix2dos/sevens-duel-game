import { scoreChildMove } from "./heuristics";
import type { Observation } from "./types";

export function chooseChildMove(observation: Observation, seed: number) {
  if (observation.legalCards.length === 0) {
    return null;
  }

  return [...observation.legalCards].sort(
    (left, right) => scoreChildMove(observation, right, seed) - scoreChildMove(observation, left, seed),
  )[0];
}
