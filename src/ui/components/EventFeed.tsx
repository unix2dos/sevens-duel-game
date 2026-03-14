import type { MatchSnapshot } from "../../game/match/engine";

interface EventFeedProps {
  snapshot: MatchSnapshot;
}

function describeEvent(event: MatchSnapshot["eventLog"][number]) {
  switch (event.type) {
    case "GAME_STARTED":
      return "牌局开始";
    case "CARD_BORROWED":
      return `${event.actor === "player" ? "你" : "AI"}借走了 ${event.cardId}`;
    case "CARD_PLAYED":
      return `${event.actor === "player" ? "你" : "AI"}打出了 ${event.cardId}`;
    case "TURN_PASSED":
      return `轮到${event.actor === "player" ? "你" : "AI"}`;
    case "GAME_FINISHED":
      return `${event.winner === "player" ? "你" : "AI"}获胜`;
  }
}

export function EventFeed({ snapshot }: EventFeedProps) {
  const items = snapshot.eventLog.slice(-5).reverse();

  return (
    <aside className="event-feed" aria-label="回合事件">
      <h2>事件流</h2>
      <ul>
        {items.map((event, index) => (
          <li key={`${event.type}-${index}`}>{describeEvent(event)}</li>
        ))}
      </ul>
    </aside>
  );
}
