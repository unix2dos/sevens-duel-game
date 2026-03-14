import type { MatchSnapshot } from "../../game/match/engine";
import { ResultStats } from "../components/ResultStats";

interface ResultScreenProps {
  snapshot: MatchSnapshot | null;
  title: string;
  onReplay: () => void;
}

export function ResultScreen({ snapshot, title, onReplay }: ResultScreenProps) {
  return (
    <main className="game-layout">
      <section className="overlay-card result-card">
        <p className="eyebrow">RESULT</p>
        <h2>{title}</h2>
        {snapshot ? <ResultStats snapshot={snapshot} /> : null}
        <button className="primary-action" onClick={onReplay} type="button">
          再来一局
        </button>
      </section>
    </main>
  );
}
