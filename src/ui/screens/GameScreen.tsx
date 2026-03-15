import { useState, useEffect, useRef } from "react";
import type { MatchSnapshot } from "../../game/match/engine";
import { GameScene } from "../../scene/pixi/GameScene";
import type { GameSceneRef } from "../../scene/pixi/GameScene";
import { ResultStats } from "../components/ResultStats";
import { gameModalResultCopy, playerWinTitle } from "../playerText";
import { selectLegalCards } from "../../game/match/selectors";

interface GameScreenProps {
  difficultyLabel: string;
  matchSnapshot: MatchSnapshot;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  onGiveCard: (cardId: string) => void;
  onRestart: () => void;
  onReplay: () => void;
  playerName: string;
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
  playerName,
  qualityLabel,
  showChildGuidance,
}: GameScreenProps) {
  const [selectedGiveCardId, setSelectedGiveCardId] = useState<string | null>(null);
  const [selectedPlayCardId, setSelectedPlayCardId] = useState<string | null>(null);
  const [isResultModalDismissed, setIsResultModalDismissed] = useState(false);
  const [isGameOverDelayComplete, setIsGameOverDelayComplete] = useState(false);
  const gameSceneRef = useRef<GameSceneRef>(null);
  const [isHintActive, setIsHintActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  // Reset hint state and timer when hint triggers
  useEffect(() => {
    if (isHintActive) {
      // Clear the timer text
      gameSceneRef.current?.updateTimerText(null);
      
      const timer = setTimeout(() => {
        setIsHintActive(false);
      }, 2500); // Wait 2.5s and then remove the hint glow
      return () => clearTimeout(timer);
    }
  }, [isHintActive]);

  // Reset timer on turn or game state changes
  useEffect(() => {
    if (matchSnapshot.turn === "player" && matchSnapshot.status === "playing") {
      setTimeLeft(15);
      gameSceneRef.current?.updateTimerText(15);
    } else {
      gameSceneRef.current?.updateTimerText(null);
    }
  }, [matchSnapshot.turn, matchSnapshot.status, matchSnapshot.eventLog.length]);

  // Countdown ticking
  useEffect(() => {
    if (matchSnapshot.turn !== "player" || matchSnapshot.status !== "playing" || isHintActive) {
      return;
    }

    if (timeLeft <= 0) {
      setIsHintActive(true);
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        gameSceneRef.current?.updateTimerText(next);
        return next;
      });
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, matchSnapshot.turn, matchSnapshot.status, isHintActive]);

  // Handle post-game delay and trigger VFX when modal shows
  useEffect(() => {
    if (matchSnapshot.status === "finished") {
      const timer = setTimeout(() => {
        setIsGameOverDelayComplete(true);
        // Fire VFX right as the modal appears
        if (gameSceneRef.current && !isResultModalDismissed) {
          gameSceneRef.current.playEndGameVFX();
        }
      }, 1500); // 1.5s delay allowing players to see the board
      return () => clearTimeout(timer);
    } else {
      setIsGameOverDelayComplete(false);
    }
  }, [matchSnapshot.status, isResultModalDismissed]);

  const showResultModal = matchSnapshot.status === "finished" && isGameOverDelayComplete && !isResultModalDismissed;
  const resultTitle =
    matchSnapshot.winner === "player" ? playerWinTitle(playerName) : "机器人获胜";

  const handleCardInteract = (cardId: string) => {
    if (matchSnapshot.phase === "borrowing") {
      setSelectedGiveCardId((prev) => (prev === cardId ? null : cardId));
    } else {
      if (selectedPlayCardId === cardId) {
        // Attempting to PLAY the selected card
        const legalIds = selectLegalCards(matchSnapshot).map((c) => c.id);
        if (legalIds.includes(cardId)) {
          onPlayCard(cardId);
          setSelectedPlayCardId(null);
        } else {
          // Reject play: trigger shake animation via global event and deselect
          window.dispatchEvent(new CustomEvent("shakeCard", { detail: { cardId } }));
          setSelectedPlayCardId(null);
        }
      } else {
        setSelectedPlayCardId(cardId);
      }
    }
  };
  return (
    <main className="game-layout game-layout--table">
      <div
        className="top-right-actions"
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.8rem"
        }}
      >
        <button
          aria-label="返回"
          className="secondary-action"
          onClick={onRestart}
          type="button"
          style={{
            background: "rgba(0, 0, 0, 0.6)",
            color: "#d4af37",
            borderColor: "rgba(212, 175, 55, 0.4)",
          }}
        >
          ↩️ 返回
        </button>
        <button
          className="secondary-action"
          onClick={() => setIsHintActive(true)}
          type="button"
          style={{
            background: isHintActive ? "rgba(212, 175, 55, 0.4)" : "rgba(0, 0, 0, 0.6)",
            color: isHintActive ? "#fff" : "#d4af37",
            borderColor: isHintActive ? "#fff" : "rgba(212, 175, 55, 0.4)",
          }}
        >
          💡 提示
        </button>
      </div>
      <section aria-label={`对局牌桌，${difficultyLabel}，特效${qualityLabel}`} className="table-shell table-shell--full" style={{ position: "relative" }}>
        <GameScene
          ref={gameSceneRef}
          difficultyLabel={difficultyLabel}
          matchSnapshot={matchSnapshot}
          onBorrow={onBorrow}
          onPlayCard={handleCardInteract}
          playerName={playerName}
          selectedGiveCardId={selectedGiveCardId}
          selectedPlayCardId={selectedPlayCardId}
          showChildGuidance={showChildGuidance}
          isHintActive={isHintActive}
        />
        {matchSnapshot.phase === "borrowing" && (
          <div className="give-card-overlay">
            {selectedGiveCardId ? (
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
            ) : matchSnapshot.turn !== "player" ? (
              <div
                className="give-card-hint"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(8, 18, 11, 0.85)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  padding: '1.2rem 2.5rem',
                  borderRadius: '999px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(212, 175, 55, 0.1)',
                  backdropFilter: 'blur(8px)',
                  animation: 'pulseGlow 2.5s infinite ease-in-out'
                }}
              >
                <span style={{
                  color: '#d4af37',
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  marginBottom: '0.3rem'
                }}>
                  对手借牌
                </span>
                <span style={{
                  color: '#fff8dc',
                  fontFamily: '"Bodoni Moda", "PingFang SC", serif',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}>
                  请选择下方手牌出借
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Persistent Replay Button after VFX */}
        {matchSnapshot.status === "finished" && isGameOverDelayComplete && (
          <div
            style={{
              position: "absolute",
              bottom: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 40,
            }}
          >
            <button
              className="primary-action"
              onClick={onReplay}
              type="button"
              style={{
                padding: "1rem 3rem",
                fontSize: "1.2rem",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 175, 55, 0.4)",
                animation: "pulseGlow 2s infinite ease-in-out"
              }}
            >
              再来一局
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
              <p className="result-copy">{gameModalResultCopy(playerName)}</p>
              <ResultStats playerName={playerName} snapshot={matchSnapshot} />
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
