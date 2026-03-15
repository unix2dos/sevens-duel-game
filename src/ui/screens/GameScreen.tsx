import { useState } from "react";
import type { MatchSnapshot } from "../../game/match/engine";
import { GameScene } from "../../scene/pixi/GameScene";
import { ResultStats } from "../components/ResultStats";

interface GameScreenProps {
  difficultyLabel: string;
  matchSnapshot: MatchSnapshot;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  onGiveCard: (cardId: string) => void;
  onRestart: () => void;
  onReplay: () => void;
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
  onReplay,
  qualityLabel,
  showChildGuidance,
}: GameScreenProps) {
  const [selectedGiveCardId, setSelectedGiveCardId] = useState<string | null>(null);
  const [selectedPlayCardId, setSelectedPlayCardId] = useState<string | null>(null);
  const [isResultModalDismissed, setIsResultModalDismissed] = useState(false);

  const showResultModal = matchSnapshot.status === "finished" && !isResultModalDismissed;
  const resultTitle = matchSnapshot.winner === "player" ? "你赢了" : "机器人获胜";

  const handleCardInteract = (cardId: string) => {
    if (matchSnapshot.phase === "borrowing") {
      setSelectedGiveCardId((prev) => (prev === cardId ? null : cardId));
    } else {
      if (selectedPlayCardId === cardId) {
        onPlayCard(cardId);
        setSelectedPlayCardId(null);
      } else {
        setSelectedPlayCardId(cardId);
      }
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
          selectedPlayCardId={selectedPlayCardId}
          showChildGuidance={showChildGuidance}
        />
        {matchSnapshot.phase === "borrowing" && selectedGiveCardId && (
          <div className="give-card-overlay">
            <button
              className="give-card-confirm"
              onClick={() => {
                setSelectedGiveCardId(null);
                onGiveCard(selectedGiveCardId);
              }}
              type="button"
            >
              <span className="give-card-subtitle">选定卡牌</span>
              <span className="give-card-title">确认出借</span>
            </button>
          </div>
        )}
        
        {showResultModal && (
          <div 
            className="overlay" 
            style={{ backdropFilter: "none", background: "rgba(0, 0, 0, 0.6)", zIndex: 50 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsResultModalDismissed(true);
            }}
          >
            <section className="overlay-card result-card result-card--luxury">
              <button 
                className="close-button" 
                onClick={() => setIsResultModalDismissed(true)} 
                style={{ 
                  position: 'absolute', top: '1rem', right: '1.2rem', 
                  background: 'transparent', border: 'none', color: 'rgba(212, 175, 55, 0.8)', 
                  fontSize: '2rem', cursor: 'pointer', zIndex: 10, lineHeight: 1 
                }}
                aria-label="关闭并在下面查看牌局复盘"
              >
                ×
              </button>
              <p className="eyebrow">TABLE CLOSED</p>
              <h2>{resultTitle}</h2>
              <p className="result-copy">这一局已经收桌。你可以立刻再开一局，或者关闭此弹窗查看桌面的最后一手牌复盘。</p>
              <ResultStats snapshot={matchSnapshot} />
              <div className="hero-actions">
                <button className="primary-action" onClick={onReplay} type="button">
                  再来一局
                </button>
                <button className="secondary-action" onClick={onRestart} type="button">
                  返回首页
                </button>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
