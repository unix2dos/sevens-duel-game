import type { MatchSnapshot } from "../../game/match/engine";
import { selectPhaseLabel } from "../../game/match/selectors";
import { GameScene } from "../../scene/pixi/GameScene";
import { EventFeed } from "../components/EventFeed";
import { Hud } from "../components/Hud";
import { PlayerConsole } from "../components/PlayerConsole";

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
  const phaseLabel = selectPhaseLabel(matchSnapshot);
  const turnLabel =
    matchSnapshot.status === "finished"
      ? "本局已结束"
      : matchSnapshot.turn === "player"
        ? "轮到你"
        : "AI 回合";

  return (
    <main className="game-layout">
      <Hud
        difficultyLabel={difficultyLabel}
        onRestart={onRestart}
        opponentCards={matchSnapshot.hands.opponent.length}
        phaseLabel={phaseLabel}
        playerCards={matchSnapshot.hands.player.length}
        qualityLabel={qualityLabel}
        turnLabel={turnLabel}
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
              发光的行动牌会单独列出来，没牌时系统会帮你借牌。
            </div>
          ) : null}
          <GameScene matchSnapshot={matchSnapshot} />
        </section>

        <aside className="side-panel">
          <EventFeed snapshot={matchSnapshot} />
        </aside>
      </div>

      <PlayerConsole
        matchSnapshot={matchSnapshot}
        onBorrow={onBorrow}
        onPlayCard={onPlayCard}
        showChildGuidance={showChildGuidance}
      />
    </main>
  );
}
