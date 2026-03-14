import { selectLegalCards } from "../match/selectors";
import type { MatchSnapshot } from "../match/engine";

export function shouldAutoBorrow(snapshot: MatchSnapshot) {
  return snapshot.difficulty === "child" && snapshot.turn === "player" && selectLegalCards(snapshot).length === 0;
}

export function getForcedCard(snapshot: MatchSnapshot) {
  if (snapshot.difficulty !== "child" || snapshot.turn !== "player") {
    return null;
  }

  const legalCards = selectLegalCards(snapshot);

  return legalCards.length === 1 ? legalCards[0] : null;
}
