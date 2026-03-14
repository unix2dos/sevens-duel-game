import type { MatchSnapshot } from "../../game/match/engine";
import { formatCardId } from "../cardPresentation";

interface EventFeedProps {
  snapshot: MatchSnapshot;
}

function describeEvent(event: MatchSnapshot["eventLog"][number]) {
  switch (event.type) {
    case "GAME_STARTED":
      return "牌局开始，等待首张 7 开线";
    case "CARD_BORROWED":
      return `${event.actor === "player" ? "你" : "AI"}借走了 ${formatCardId(event.cardId)}`;
    case "CARD_PLAYED":
      return `${event.actor === "player" ? "你" : "AI"}打出了 ${formatCardId(event.cardId)}`;
    case "TURN_PASSED":
      return event.actor === "player" ? "轮到你，查看下方行动牌组" : "AI 接手回合";
    case "GAME_FINISHED":
      return `${event.winner === "player" ? "你" : "AI"}获胜，牌局结算完成`;
  }
}

export function EventFeed({ snapshot }: EventFeedProps) {
  const items = snapshot.eventLog.slice(-5).reverse();

  return (
    <aside className="event-feed" aria-label="回合事件">
      <div className="event-feed-header">
        <div>
          <span>战况回放</span>
          <h2>事件流</h2>
        </div>
        <strong>{snapshot.eventLog.length} 条</strong>
      </div>
      <ul>
        {items.map((event, index) => (
          <li key={`${event.type}-${index}`}>
            <span className="event-dot" />
            <p>{describeEvent(event)}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
