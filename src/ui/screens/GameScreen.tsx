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
      setSelectedGiveCardId(cardId);
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
        {matchSnapshot.phase === "borrowing" && (
          <div style={{ position: "absolute", bottom: 130, left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: "rgba(15, 63, 31, 0.9)", padding: "16px 32px", borderRadius: 24, border: "1px solid rgba(212, 175, 55, 0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            <span style={{ color: "#fff8dc", fontWeight: "bold", fontSize: 15, fontFamily: "'IBM Plex Sans', sans-serif" }}>AI 无牌可出，请选择一张手牌借给它</span>
            <button
              className="primary-action"
              disabled={!selectedGiveCardId}
              onClick={() => {
                if (selectedGiveCardId) {
                  setSelectedGiveCardId(null);
                  onGiveCard(selectedGiveCardId);
                }
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
