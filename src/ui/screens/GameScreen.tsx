import type { MatchSnapshot } from "../../game/match/engine";
import { GameScene } from "../../scene/pixi/GameScene";
import { EventFeed } from "../components/EventFeed";
import { Hud } from "../components/Hud";

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
      <Hud
        difficultyLabel={difficultyLabel}
        onBorrow={onBorrow}
        onRestart={onRestart}
        qualityLabel={qualityLabel}
      />

      <div className="game-main">
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

        <EventFeed snapshot={matchSnapshot} />
      </div>
    </main>
  );
}
