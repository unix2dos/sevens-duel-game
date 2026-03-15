import type { MatchSnapshot } from "../match/engine";
import type { Card } from "../core/types";

export function shouldAutoBorrow(snapshot: MatchSnapshot) {
  void snapshot;

  return false;
}

export function getForcedCard(snapshot: MatchSnapshot): Card | null {
  void snapshot;

  return null;
}
