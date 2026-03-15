import type { MatchSnapshot } from "../../game/match/engine";

interface ResultStatsProps {
  snapshot: MatchSnapshot;
}

function finishReasonLabel(snapshot: MatchSnapshot) {
  if (snapshot.reason === "borrowed-empty") {
    return "借牌后手牌归零";
  }

  if (snapshot.reason === "played-all") {
    return "打光手牌";
  }

  return "未结束";
}

export function ResultStats({ snapshot }: ResultStatsProps) {
  const playerPlays = snapshot.eventLog.filter(
    (e) => e.type === "CARD_PLAYED" && e.actor === "player",
  ).length;
  const aiPlays = snapshot.eventLog.filter(
    (e) => e.type === "CARD_PLAYED" && e.actor === "opponent",
  ).length;
  const playerBorrows = snapshot.eventLog.filter(
    (e) => e.type === "CARD_BORROWED" && e.actor === "player",
  ).length;
  const aiBorrows = snapshot.eventLog.filter(
    (e) => e.type === "CARD_BORROWED" && e.actor === "opponent",
  ).length;
  const turnCount = snapshot.eventLog.filter((e) => e.type === "TURN_PASSED").length;

  return (
    <div className="result-stats">
      <p>🃏 你出牌 {playerPlays} 张 · 机器人出牌 {aiPlays} 张</p>
      <p>🤝 你借牌 {playerBorrows} 次 · 机器人借牌 {aiBorrows} 次</p>
      <p>🔄 回合切换 {turnCount} 次</p>
      <p>✋ 剩余手牌：你 {snapshot.hands.player.length} 张 · 机器人 {snapshot.hands.opponent.length} 张</p>
      <p>📋 结束原因：{finishReasonLabel(snapshot)}</p>
    </div>
  );
}
