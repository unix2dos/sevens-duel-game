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
    <main className="game-layout game-layout--table">
      <button
        aria-label="返回首页"
        className="table-return-button secondary-action"
        onClick={onRestart}
        type="button"
      >
        返回首页
      </button>
      <section aria-label={`对局牌桌，${difficultyLabel}，特效${qualityLabel}`} className="table-shell table-shell--full">
        <GameScene
          difficultyLabel={difficultyLabel}
          matchSnapshot={matchSnapshot}
          onBorrow={onBorrow}
          onPlayCard={onPlayCard}
          showChildGuidance={showChildGuidance}
        />
      </section>
    </main>
  );
}
