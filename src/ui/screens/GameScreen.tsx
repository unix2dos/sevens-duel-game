import type { MatchSnapshot } from "../../game/match/engine";
import { GameScene } from "../../scene/pixi/GameScene";

interface GameScreenProps {
  difficultyLabel: string;
  matchSnapshot: MatchSnapshot;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  onRestart: () => void;
  qualityLabel: string;
  showChildGuidance: boolean;
}

export function GameScreen({
  difficultyLabel,
  matchSnapshot,
  onBorrow,
  onPlayCard,
  onRestart,
  qualityLabel,
  showChildGuidance,
}: GameScreenProps) {
  return (
    <main className="game-layout">
      <header className="hud">
        <div>
          <span className="hud-label">当前难度</span>
          <strong>当前难度：{difficultyLabel}</strong>
        </div>
        <div>
          <span className="hud-label">特效档位</span>
          <strong>特效：{qualityLabel}</strong>
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
        {showChildGuidance ? (
          <div className="guidance-layer" data-testid="guidance-layer">
            发光的牌可以直接点，没牌时系统会帮你借牌。
          </div>
        ) : null}
        <GameScene
          matchSnapshot={matchSnapshot}
          onPlayCard={onPlayCard}
        />
      </section>
    </main>
  );
}
