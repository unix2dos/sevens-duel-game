import { Container, Graphics, Text } from "pixi.js";

import { cardTheme } from "../cards/cardTheme";
import type { TableLayout } from "../layout/tableLayout";
import type { MatchSnapshot } from "../../../game/match/engine";

interface TopStatusLayerOptions {
  difficultyLabel: string;
  layout: TableLayout;
  snapshot: MatchSnapshot;
}

function makeLabel(text: string, size: number, color = cardTheme.textMuted) {
  return new Text({
    style: {
      fill: color,
      fontFamily: "IBM Plex Sans, sans-serif",
      fontSize: size,
      fontWeight: "600",
    },
    text,
  });
}

function makeValue(text: string, size: number) {
  return new Text({
    style: {
      fill: cardTheme.textPrimary,
      fontFamily: "Sora, IBM Plex Sans, sans-serif",
      fontSize: size,
      fontWeight: "800",
    },
    text,
  });
}

export function createTopStatusLayer({
  difficultyLabel,
  layout,
  snapshot,
}: TopStatusLayerOptions) {
  const root = new Container();
  const shell = new Graphics();
  const { topBar } = layout;
  const turnLabel =
    snapshot.status === "finished"
      ? snapshot.winner === "player"
        ? "你赢了"
        : "AI 获胜"
      : snapshot.turn === "player"
        ? "轮到你"
        : "AI 回合";

  shell
    .roundRect(topBar.x, topBar.y, topBar.width, topBar.height, 24)
    .fill({ color: cardTheme.velvetGlow, alpha: 0.54 })
    .stroke({ color: cardTheme.lineSoft, alpha: 0.85, width: 1 });
  root.addChild(shell);

  const phaseLabel = snapshot.phase === "opening" ? "等待开线" : "牌局进行中";
  const countSummary = layout.compact
    ? `AI ${snapshot.hands.opponent.length}`
    : `你的手牌 ${snapshot.hands.player.length} · AI 手牌 ${snapshot.hands.opponent.length}`;

  const club = makeLabel(`${difficultyLabel}局`, layout.compact ? 11 : 13);
  club.position.set(topBar.x + 20, topBar.y + 16);
  root.addChild(club);

  const turn = makeValue(turnLabel, layout.compact ? 22 : 24);
  turn.position.set(topBar.x + 20, topBar.y + 36);
  root.addChild(turn);

  if (!layout.compact) {
    const phase = makeLabel(phaseLabel, 12);
    phase.anchor.set(0.5, 0);
    phase.position.set(topBar.x + topBar.width * 0.55, topBar.y + 20);
    root.addChild(phase);
  }

  const counts = makeValue(countSummary, layout.compact ? 16 : 15);
  counts.anchor.set(1, layout.compact ? 0 : 0.5);
  counts.position.set(
    topBar.x + topBar.width - 18,
    layout.compact ? topBar.y + 36 : topBar.y + topBar.height / 2,
  );
  root.addChild(counts);

  return root;
}
