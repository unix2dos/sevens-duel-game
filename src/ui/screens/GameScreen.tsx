import type { MatchSnapshot } from "../../game/match/engine";
import { GameScene } from "../../scene/pixi/GameScene";

interface GameScreenProps {
  difficultyLabel: string;
  matchSnapshot: MatchSnapshot;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  onRestart: () => void;
}

export function GameScreen({
  difficultyLabel,
  matchSnapshot,
  onBorrow,
  onPlayCard,
  onRestart,
}: GameScreenProps) {
  return (
    <main className="game-layout">
      <header className="hud">
        <div>
          <span className="hud-label">当前难度</span>
          <strong>当前难度：{difficultyLabel}</strong>
        </div>
        <div className="hud-actions">
          <button className="secondary-action" onClick={onBorrow} type="button">
            随机借牌
          </button>
          <button className="secondary-action" onClick={onRestart} type="button">
            返回首页
          </button>
        </div>
      </header>

      <section className="table-shell">
        <div className="table-grid">
          <span>黑桃</span>
          <span>红桃</span>
          <span>梅花</span>
          <span>方块</span>
        </div>
        <GameScene
          matchSnapshot={matchSnapshot}
          onPlayCard={onPlayCard}
        />
      </section>
    </main>
  );
}
