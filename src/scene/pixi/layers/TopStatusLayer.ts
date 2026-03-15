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

function createIndicatorBadge(color: number) {
  const badge = new Graphics();
  badge
    .circle(0, 0, 4.5)
    .fill({ color, alpha: 0.95 })
    .stroke({ color: 0xffffff, alpha: 0.9, width: 1.5 });
  return badge;
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

  const club = makeLabel(`${difficultyLabel}局`, layout.compact ? 11 : 13);
  club.position.set(topBar.x + 20, topBar.y + 16);
  root.addChild(club);

  const turn = makeValue(turnLabel, layout.compact ? 22 : 24);
  turn.position.set(topBar.x + 20, topBar.y + 36);
  root.addChild(turn);

  const phase = makeLabel(phaseLabel, layout.compact ? 11 : 12);
  phase.anchor.set(0.5, 0);
  phase.position.set(
    layout.compact ? topBar.x + topBar.width / 2 : topBar.x + topBar.width * 0.55,
    layout.compact ? topBar.y + 14 : topBar.y + 20,
  );
  root.addChild(phase);

  const countsContainer = new Container();

  if (layout.compact) {
    let currentX = 0;

    const playerText = makeValue(`你 ${snapshot.hands.player.length}`, 13);
    const playerBadge = createIndicatorBadge(0x3b82f6);
    playerBadge.position.set(currentX + 4.5, playerText.height / 2);
    playerText.position.set(currentX + 14, 0);

    currentX += 14 + playerText.width + 6;

    const aiText = makeValue(`AI ${snapshot.hands.opponent.length}`, 13);
    const aiBadge = createIndicatorBadge(0xef4444);
    aiBadge.position.set(currentX + 4.5, aiText.height / 2);
    aiText.position.set(currentX + 14, 0);

    countsContainer.addChild(playerBadge, playerText, aiBadge, aiText);
  } else {
    let currentX = 0;
    
    const playerText = makeValue(` 你的手牌 ${snapshot.hands.player.length} · `, 15);
    const playerBadge = createIndicatorBadge(0x3b82f6);
    playerBadge.position.set(currentX + 5.5, playerText.height / 2);
    playerText.position.set(currentX + 16, 0);
    
    currentX += 16 + playerText.width + 4;
    
    const aiText = makeValue(` AI 手牌 ${snapshot.hands.opponent.length}`, 15);
    const aiBadge = createIndicatorBadge(0xef4444);
    aiBadge.position.set(currentX + 5.5, aiText.height / 2);
    aiText.position.set(currentX + 16, 0);
    
    countsContainer.addChild(playerBadge, playerText, aiBadge, aiText);
  }

  countsContainer.pivot.set(countsContainer.width, layout.compact ? 0 : countsContainer.height / 2);
  countsContainer.position.set(
    topBar.x + topBar.width - 18,
    layout.compact ? topBar.y + 36 : topBar.y + topBar.height / 2,
  );
  root.addChild(countsContainer);

  return root;
}
