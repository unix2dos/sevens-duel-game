import { Container, Graphics, Text } from "pixi.js";

import { cardTheme } from "../cards/cardTheme";
import type { TableLayout } from "../layout/tableLayout";
import type { MatchSnapshot } from "../../../game/match/engine";
import { playerHandLabel, playerTurnLabel, playerWinTitle } from "../../../ui/playerText";

interface TopStatusLayerOptions {
  difficultyLabel: string;
  layout: TableLayout;
  playerName: string;
  snapshot: MatchSnapshot;
}

function makeLabel(text: string, size: number, color = 0xdab775) {
  return new Text({
    style: {
      fill: color,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: size,
      fontWeight: "600",
      letterSpacing: 2,
      dropShadow: { color: 0x000000, alpha: 0.6, blur: 2, distance: 1 }
    },
    text,
  });
}

function makeValue(text: string, size: number) {
  return new Text({
    style: {
      fill: 0xfff8dc,
      fontFamily: "'Bodoni Moda', serif",
      fontSize: size,
      fontWeight: "700",
      letterSpacing: 1,
      dropShadow: { color: 0x000000, alpha: 0.8, blur: 3, distance: 2 }
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
  playerName,
  snapshot,
}: TopStatusLayerOptions) {
  const root = new Container();
  const shell = new Graphics();
  const { topBar } = layout;
  const turnLabel =
    snapshot.status === "finished"
      ? snapshot.winner === "player"
        ? playerWinTitle(playerName)
        : "机器人获胜"
      : snapshot.turn === "player"
        ? playerTurnLabel(playerName)
        : "机器人回合";

  shell
    .roundRect(topBar.x, topBar.y, topBar.width, topBar.height, 24)
    .fill({ color: cardTheme.velvetGlow, alpha: 0.54 })
    .stroke({ color: cardTheme.lineSoft, alpha: 0.85, width: 1 });
  root.addChild(shell);

  const club = makeLabel(`${difficultyLabel}局`, layout.compact ? 11 : 13);
  club.position.set(topBar.x + 20, topBar.y + 16);
  root.addChild(club);

  const turn = makeValue(turnLabel, layout.compact ? 22 : 24);
  turn.position.set(topBar.x + 20, topBar.y + 36);
  root.addChild(turn);

  const countsContainer = new Container();

  if (layout.compact) {
    let currentX = 0;

    const playerText = makeValue(`${playerName} ${snapshot.hands.player.length}`, 13);
    const playerBadge = createIndicatorBadge(0x3b82f6);
    playerBadge.position.set(currentX + 4.5, playerText.height / 2);
    playerText.position.set(currentX + 14, 0);

    currentX += 14 + playerText.width + 6;

    const aiText = makeValue(`机器人 ${snapshot.hands.opponent.length}`, 13);
    const aiBadge = createIndicatorBadge(0xef4444);
    aiBadge.position.set(currentX + 4.5, aiText.height / 2);
    aiText.position.set(currentX + 14, 0);

    countsContainer.addChild(playerBadge, playerText, aiBadge, aiText);
  } else {
    let currentX = 0;
    
    const playerText = makeValue(` ${playerHandLabel(playerName)} ${snapshot.hands.player.length} · `, 15);
    const playerBadge = createIndicatorBadge(0x3b82f6);
    playerBadge.position.set(currentX + 5.5, playerText.height / 2);
    playerText.position.set(currentX + 16, 0);
    
    currentX += 16 + playerText.width + 4;
    
    const aiText = makeValue(` 机器人手牌 ${snapshot.hands.opponent.length}`, 15);
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
