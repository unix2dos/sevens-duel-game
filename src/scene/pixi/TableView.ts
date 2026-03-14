import { Container, Graphics, Text } from "pixi.js";

import { cyberColors } from "./effects";
import { createCardView } from "./CardView";
import type { MatchSnapshot } from "../../game/match/engine";
import type { Card, Suit } from "../../game/core/types";

interface TableViewOptions {
  height: number;
  snapshot: MatchSnapshot;
  width: number;
}

const suits: Array<{ key: Suit; label: string }> = [
  { key: "spades", label: "黑桃" },
  { key: "hearts", label: "红桃" },
  { key: "clubs", label: "梅花" },
  { key: "diamonds", label: "方块" },
];

const rankValue: Record<Card["rank"], number> = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

function suitCards(layout: Card[], suit: Suit) {
  return layout
    .filter((card) => card.suit === suit)
    .sort((left, right) => rankValue[left.rank] - rankValue[right.rank]);
}

export function createTableView({
  height,
  snapshot,
  width,
}: TableViewOptions) {
  const root = new Container();
  const board = new Graphics();
  const halo = new Graphics();
  const header = new Text({
    style: {
      fill: cyberColors.text,
      fontFamily: "Sora, sans-serif",
      fontSize: 24,
      fontWeight: "700",
    },
    text: snapshot.turn === "player" ? "你的回合" : "AI 回合",
  });
  const boardHeight = height - 124;
  const laneWidth = width / suits.length;

  halo.roundRect(8, 8, width - 16, height - 16, 32).fill({
    alpha: 0.65,
    color: cyberColors.halo,
  });

  board.roundRect(0, 0, width, height, 28).fill(cyberColors.panel);
  board.stroke({ color: cyberColors.border, alpha: 0.8, width: 1.5 });
  root.addChild(halo, board);

  header.position.set(24, 20);
  root.addChild(header);

  const subheader = new Text({
    style: {
      fill: cyberColors.muted,
      fontFamily: "IBM Plex Sans, sans-serif",
      fontSize: 15,
    },
    text:
      snapshot.turn === "player"
        ? "从下方行动卡区选择合法牌"
        : "AI 正在评估可出牌与借牌收益",
  });
  subheader.position.set(24, 52);
  root.addChild(subheader);

  suits.forEach((suit, index) => {
    const lane = new Container();
    const laneBg = new Graphics();
    const track = new Graphics();
    const laneLabel = new Text({
      style: {
        fill: cyberColors.muted,
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: 15,
        fontWeight: "600",
      },
      text: suit.label,
    });
    const laneHint = new Text({
      style: {
        fill: cyberColors.muted,
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: 14,
      },
      text: "等待 7 开线",
    });
    const cards = suitCards(snapshot.layout, suit.key);
    const laneInnerWidth = laneWidth - 32;
    const centerX = laneInnerWidth / 2;
    const centerY = 112;
    const miniCardWidth = 32;
    const miniCardHeight = 48;
    const cardSpacing = Math.min(13, (laneInnerWidth - miniCardWidth) / 12);

    laneBg
      .roundRect(0, 0, laneWidth - 16, boardHeight, 22)
      .fill({ alpha: 0.24, color: cyberColors.panelRaised })
      .stroke({ color: cyberColors.border, alpha: 0.4, width: 1 });
    track
      .roundRect(18, centerY - 4, laneInnerWidth - 36, 8, 999)
      .fill({ alpha: 0.45, color: cyberColors.track })
      .stroke({ color: cyberColors.neon, alpha: 0.32, width: 1 });
    laneLabel.position.set(18, 14);
    laneHint.position.set(18, 44);
    lane.position.set(index * laneWidth + 8, 96);
    lane.addChild(laneBg, track, laneLabel, laneHint);

    const centerSlot = createCardView({
      card: { id: `${suit.key}-7`, rank: 7, suit: suit.key },
      height: miniCardHeight,
      isFaceUp: cards.length > 0,
      isInteractive: false,
      isLegal: false,
      width: miniCardWidth,
    });
    centerSlot.alpha = cards.length > 0 ? 1 : 0.48;
    centerSlot.position.set(centerX - miniCardWidth / 2, centerY - miniCardHeight / 2);
    lane.addChild(centerSlot);

    if (cards.length > 0) {
      laneHint.text = `${cards.length} 张已铺开`;
    }

    cards.forEach((card) => {
      const offset = rankValue[card.rank] - 7;

      if (offset === 0) {
        return;
      }

      const miniCard = createCardView({
        card,
        height: miniCardHeight,
        isFaceUp: true,
        isInteractive: false,
        isLegal: false,
        width: miniCardWidth,
      });

      miniCard.position.set(
        centerX - miniCardWidth / 2 + offset * cardSpacing,
        centerY - miniCardHeight / 2,
      );
      lane.addChild(miniCard);
    });

    root.addChild(lane);
  });

  const opponentCount = new Text({
    style: {
      fill: cyberColors.text,
      fontFamily: "IBM Plex Sans, sans-serif",
      fontSize: 15,
      fontWeight: "600",
    },
    text: `AI 手牌：${snapshot.hands.opponent.length}`,
  });
  opponentCount.position.set(width - 130, 28);
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
      width: 58,
    });
    view.position.set(width - 206 + index * 18, 58 + index * 2);
    root.addChild(view);
  }

  return root;
}
