import { useState } from "react";
import type { MatchSnapshot } from "../../game/match/engine";
import { GameScene } from "../../scene/pixi/GameScene";

interface GameScreenProps {
  difficultyLabel: string;
  matchSnapshot: MatchSnapshot;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  onGiveCard: (cardId: string) => void;
  onRestart: () => void;
  qualityLabel: string;
  showChildGuidance: boolean;
}

export function GameScreen({
  difficultyLabel,
  matchSnapshot,
  onBorrow,
  onPlayCard,
  onGiveCard,
  onRestart,
  qualityLabel,
  showChildGuidance,
}: GameScreenProps) {
  const [selectedGiveCardId, setSelectedGiveCardId] = useState<string | null>(null);

  const handleCardInteract = (cardId: string) => {
    if (matchSnapshot.phase === "borrowing") {
      setSelectedGiveCardId((prev) => (prev === cardId ? null : cardId));
    } else {
      onPlayCard(cardId);
    }
  };
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
      <section aria-label={`对局牌桌，${difficultyLabel}，特效${qualityLabel}`} className="table-shell table-shell--full" style={{ position: "relative" }}>
        <GameScene
          difficultyLabel={difficultyLabel}
          matchSnapshot={matchSnapshot}
          onBorrow={onBorrow}
          onPlayCard={handleCardInteract}
          selectedGiveCardId={selectedGiveCardId}
          showChildGuidance={showChildGuidance}
        />
        {matchSnapshot.phase === "borrowing" && selectedGiveCardId && (
          <div className="give-card-overlay">
            <button
              className="primary-action give-card-confirm"
              onClick={() => {
                setSelectedGiveCardId(null);
                onGiveCard(selectedGiveCardId);
              }}
              type="button"
            >
              确认借出
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
