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
  const borrowCount = snapshot.eventLog.filter((event) => event.type === "CARD_BORROWED").length;
  const turnCount = snapshot.eventLog.filter((event) => event.type === "TURN_PASSED").length;

  return (
    <div className="result-stats">
      <p>回合切换：{turnCount}</p>
      <p>借牌次数：{borrowCount}</p>
      <p>结束原因：{finishReasonLabel(snapshot)}</p>
    </div>
  );
}
