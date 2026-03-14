import { Container, Graphics, Text } from "pixi.js";

import { cyberColors } from "./effects";
import { createCardView } from "./CardView";
import { selectLegalCards } from "../../game/match/selectors";
import type { MatchSnapshot } from "../../game/match/engine";
import type { Card, Suit } from "../../game/core/types";

interface TableViewOptions {
  height: number;
  onPlayCard: (cardId: string) => void;
  snapshot: MatchSnapshot;
  width: number;
}

const suits: Array<{ key: Suit; label: string }> = [
  { key: "spades", label: "黑桃" },
  { key: "hearts", label: "红桃" },
  { key: "clubs", label: "梅花" },
  { key: "diamonds", label: "方块" },
];

function suitCards(layout: Card[], suit: Suit) {
  return layout.filter((card) => card.suit === suit).map((card) => `${card.rank}`).join(" · ") || "等待 7 开线";
}

export function createTableView({
  height,
  onPlayCard,
  snapshot,
  width,
}: TableViewOptions) {
  const root = new Container();
  const board = new Graphics();
  const header = new Text({
    style: {
      fill: cyberColors.text,
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: 26,
      fontWeight: "700",
    },
    text: snapshot.turn === "player" ? "你的回合" : "AI 回合",
  });
  const legalIds = new Set(selectLegalCards(snapshot).map((card) => card.id));
  const boardHeight = height * 0.58;
  const laneWidth = width / suits.length;

  board.roundRect(0, 0, width, height, 28).fill(cyberColors.panel);
  root.addChild(board);

  header.position.set(24, 20);
  root.addChild(header);

  suits.forEach((suit, index) => {
    const lane = new Container();
    const laneBg = new Graphics();
    const laneLabel = new Text({
      style: {
        fill: cyberColors.muted,
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: 16,
        fontWeight: "600",
      },
      text: suit.label,
    });
    const laneText = new Text({
      style: {
        fill: cyberColors.text,
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: 14,
        wordWrap: true,
        wordWrapWidth: laneWidth - 36,
      },
      text: suitCards(snapshot.layout, suit.key),
    });

    laneBg
      .roundRect(0, 0, laneWidth - 16, boardHeight - 80, 20)
      .fill({ alpha: 0.22, color: cyberColors.cardBack })
      .stroke({ color: cyberColors.neon, alpha: 0.18, width: 1 });
    laneLabel.position.set(18, 14);
    laneText.position.set(18, 52);
    lane.position.set(index * laneWidth + 8, 68);
    lane.addChild(laneBg, laneLabel, laneText);
    root.addChild(lane);
  });

  const opponentCount = new Text({
    style: {
      fill: cyberColors.text,
      fontFamily: "IBM Plex Sans, sans-serif",
      fontSize: 15,
    },
    text: `AI 手牌：${snapshot.hands.opponent.length}`,
  });
  opponentCount.position.set(width - 118, 26);
  root.addChild(opponentCount);

  const previewCount = Math.min(snapshot.hands.opponent.length, 3);
  for (let index = 0; index < previewCount; index += 1) {
    const card = snapshot.hands.opponent[index];
    const view = createCardView({
      card,
      height: 86,
      isFaceUp: false,
      isInteractive: false,
      isLegal: false,
      width: 62,
    });
    view.position.set(width - 210 + index * 20, 58);
    root.addChild(view);
  }

  snapshot.hands.player.forEach((card, index) => {
    const view = createCardView({
      card,
      height: 104,
      isFaceUp: true,
      isInteractive: snapshot.turn === "player" && snapshot.status === "playing",
      isLegal: legalIds.has(card.id),
      onPress: onPlayCard,
      width: 74,
    });
    view.position.set(24 + index * 26, height - 128);
    root.addChild(view);
  });

  return root;
}
