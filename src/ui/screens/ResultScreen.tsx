import type { MatchSnapshot } from "../../game/match/engine";
import { ResultStats } from "../components/ResultStats";

interface ResultScreenProps {
  snapshot: MatchSnapshot | null;
  title: string;
  onReplay: () => void;
}

export function ResultScreen({ snapshot, title, onReplay }: ResultScreenProps) {
  return (
    <main className="game-layout result-layout">
      <section className="overlay-card result-card result-card--luxury">
        <p className="eyebrow">TABLE CLOSED</p>
        <h2>{title}</h2>
        <p className="result-copy">这一局已经收桌。你可以立刻再开一局，或者回到首页重新挑选难度。</p>
        {snapshot ? <ResultStats snapshot={snapshot} /> : null}
        <div className="hero-actions">
          <button className="primary-action" onClick={onReplay} type="button">
            再来一局
          </button>
        </div>
      </section>
    </main>
  );
}
