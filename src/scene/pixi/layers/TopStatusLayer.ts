import { Container, Graphics, Text } from "pixi.js";

import type { TableLayout } from "../layout/tableLayout";
import type { MatchSnapshot } from "../../../game/match/engine";

interface TopStatusLayerOptions {
  difficultyLabel: string;
  layout: TableLayout;
  playerName: string;
  snapshot: MatchSnapshot;
  playerTimeLeft?: number;
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
  layout,
  playerName,
  snapshot,
}: TopStatusLayerOptions) {
  const root = new Container();
  const { topBar } = layout;

  const isCramped = topBar.width < 800;
  const paddingX = isCramped ? 16 : 32;
  // Significantly bump up font sizes
  const fontSizePrimary = layout.compact ? 16 : 20;
  const fontSizeSecondary = layout.compact ? 14 : 16;
  
  // Use a very soft, faint glow behind text instead of a hard black box, or just no box at all.
  // We'll use a very faint gradient or simple drop shadow on text. Since text has excellent drop shadow,
  // we can completely remove the black capsule bg to integrate seamlessly into the table.

  // --- Left Side (Player Info) ---
  const leftContainer = new Container();
  
  const pBadge = createIndicatorBadge(0x3b82f6);
  const displayName = isCramped && playerName.length > 6 ? playerName.substring(0, 6) + "…" : playerName;
  const pText = makeValue(displayName, fontSizePrimary);
  const pCards = makeLabel(`${snapshot.hands.player.length} 张`, fontSizeSecondary, 0xbbbaa6);
  
  pBadge.scale.set(layout.compact ? 1 : 1.2);
  pBadge.position.set(0, pText.height / 2);
  pText.position.set(20, 0); // space for badge
  pCards.position.set(pText.x + pText.width + 16, pText.height - pCards.height - 2);
  
  leftContainer.addChild(pBadge, pText, pCards);
  leftContainer.position.set(topBar.x + paddingX, topBar.y + (layout.compact ? 16 : 24));
  
  // Optional active turn indicator: a soft underline or glow
  if (snapshot.status === "playing" && snapshot.turn === "player") {
    const activeLine = new Graphics();
    activeLine.roundRect(0, pText.height + 6, leftContainer.width, 3, 2)
      .fill({ color: 0xd4af37, alpha: 0.8 });
    leftContainer.addChild(activeLine);
  }
  
  root.addChild(leftContainer);

  // --- Right Side (Opponent Info) ---
  const rightContainer = new Container();
  
  const aText = makeValue("机器人", fontSizePrimary);
  const aCards = makeLabel(`${snapshot.hands.opponent.length} 张`, fontSizeSecondary, 0xbbbaa6);
  const aBadge = createIndicatorBadge(0xef4444);
  aBadge.scale.set(layout.compact ? 1 : 1.2);

  aText.position.set(0, 0);
  aCards.position.set(aText.width + 16, aText.height - aCards.height - 2);
  aBadge.position.set(aCards.x + aCards.width + 20, aText.height / 2);
  
  rightContainer.addChild(aText, aCards, aBadge);
  const rightWidth = aBadge.x + 8;
  rightContainer.position.set(topBar.x + topBar.width - rightWidth - paddingX, topBar.y + (layout.compact ? 16 : 24));
  
  if (snapshot.status === "playing" && snapshot.turn !== "player") {
    const activeLine = new Graphics();
    activeLine.roundRect(0, aText.height + 6, rightWidth, 3, 2)
      .fill({ color: 0xd4af37, alpha: 0.8 });
    rightContainer.addChild(activeLine);
  }

  root.addChild(rightContainer);

  return root;
}
