import type { MatchSnapshot } from "../../game/match/engine";
import { ResultStats } from "../components/ResultStats";
import { gameResultCopy } from "../playerText";

interface ResultScreenProps {
  onBackHome: () => void;
  onReplay: () => void;
  playerName: string;
  snapshot: MatchSnapshot | null;
  title: string;
}

export function ResultScreen({ snapshot, title, onBackHome, onReplay, playerName }: ResultScreenProps) {
  return (
    <main className="game-layout result-layout">
      <section className="overlay-card result-card result-card--luxury">
        <p className="eyebrow">TABLE CLOSED</p>
        <h2>{title}</h2>
        <p className="result-copy">{gameResultCopy(playerName)}</p>
        {snapshot ? <ResultStats playerName={playerName} snapshot={snapshot} /> : null}
        <div className="hero-actions">
          <button className="primary-action" onClick={onReplay} type="button">
            再来一局
          </button>
          <button className="secondary-action" onClick={onBackHome} type="button">
            返回首页
          </button>
        </div>
      </section>
    </main>
  );
}
