import { selectLegalCards, selectPhaseLabel } from "../../game/match/selectors";
import type { MatchSnapshot } from "../../game/match/engine";
import { cardTone, formatCardCompact, formatCardFull, sortCardsForDisplay } from "../cardPresentation";

interface PlayerConsoleProps {
  matchSnapshot: MatchSnapshot;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  showChildGuidance: boolean;
}

export function PlayerConsole({
  matchSnapshot,
  onBorrow,
  onPlayCard,
  showChildGuidance,
}: PlayerConsoleProps) {
  const legalCards = sortCardsForDisplay(selectLegalCards(matchSnapshot));
  const legalCardIds = new Set(legalCards.map((card) => card.id));
  const sortedHand = sortCardsForDisplay(matchSnapshot.hands.player);
  const isPlayersTurn = matchSnapshot.turn === "player" && matchSnapshot.status === "playing";
  const canBorrow = isPlayersTurn && legalCards.length === 0;
  const phaseLabel = selectPhaseLabel(matchSnapshot);

  return (
    <section aria-label="玩家控制台" className="player-console">
      <div className="console-summary">
        <article>
          <span>当前节奏</span>
          <strong>{isPlayersTurn ? "轮到你行动" : "AI 正在推进"}</strong>
        </article>
        <article>
          <span>阶段</span>
          <strong>{phaseLabel}</strong>
        </article>
        <article>
          <span>手牌差</span>
          <strong>{matchSnapshot.hands.player.length - matchSnapshot.hands.opponent.length}</strong>
        </article>
      </div>

      <div className="console-panel">
        <div className="console-heading">
          <div>
            <span>当前可打</span>
            <strong>{isPlayersTurn ? "只保留合法动作，避免误触" : "等待 AI 回合结束"}</strong>
          </div>
          <span className="console-badge">{legalCards.length} 张</span>
        </div>

        {isPlayersTurn && legalCards.length > 0 ? (
          <div className="legal-card-rack">
            {legalCards.map((card) => (
              <button
                aria-label={`打出 ${formatCardFull(card)}`}
                className="legal-card-button"
                data-tone={cardTone(card)}
                key={card.id}
                onClick={() => onPlayCard(card.id)}
                type="button"
              >
                <span className="legal-card-label">立即打出</span>
                <strong>{formatCardCompact(card)}</strong>
                <small>{formatCardFull(card)}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="borrow-callout">
            <div>
              <span>无合法牌</span>
              <strong>{showChildGuidance ? "系统会优先帮你借牌" : "需要从 AI 手牌中随机借 1 张"}</strong>
            </div>
            <button
              className="primary-action"
              disabled={!canBorrow}
              onClick={onBorrow}
              type="button"
            >
              {canBorrow ? "执行随机借牌" : "等待系统推进"}
            </button>
          </div>
        )}
      </div>

      <div className="console-panel">
        <div className="console-heading">
          <div>
            <span>全手牌</span>
            <strong>按花色整理，合法牌会被抬升标记</strong>
          </div>
          <span className="console-badge">{sortedHand.length} 张</span>
        </div>

        <div className="hand-grid-panel">
          {sortedHand.map((card) => (
            <div
              className="hand-card"
              data-legal={legalCardIds.has(card.id)}
              data-tone={cardTone(card)}
              key={card.id}
            >
              <span>{formatCardCompact(card)}</span>
              <small>{formatCardFull(card)}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
