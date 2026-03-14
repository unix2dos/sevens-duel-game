import { getLegalCards } from "../core/rules";
import type { MatchSnapshot } from "./engine";

export function selectLegalCards(snapshot: MatchSnapshot) {
  const hand = snapshot.turn === "player" ? snapshot.hands.player : snapshot.hands.opponent;

  return getLegalCards(snapshot.layout, hand);
}

export function selectOpponentHandCount(snapshot: MatchSnapshot, viewer: "player" | "opponent" = "player") {
  return viewer === "player" ? snapshot.hands.opponent.length : snapshot.hands.player.length;
}

export function selectPhaseLabel(snapshot: MatchSnapshot) {
  switch (snapshot.phase) {
    case "opening":
      return "开局";
    case "playing":
      return "对局中";
    case "finished":
      return "已结束";
  }
}

export function selectWinnerSummary(snapshot: MatchSnapshot) {
  if (snapshot.status !== "finished" || !snapshot.winner) {
    return "对局进行中";
  }

  return snapshot.winner === "player" ? "玩家获胜" : "AI 获胜";
}
