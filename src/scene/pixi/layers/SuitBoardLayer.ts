import { Container, Graphics, Text } from "pixi.js";

import { createCardView } from "../CardView";
import { cardTheme } from "../cards/cardTheme";
import type { TableLayout } from "../layout/tableLayout";
import type { MatchSnapshot } from "../../../game/match/engine";
import type { Card, Rank, Suit } from "../../../game/core/types";

interface SuitBoardLayerOptions {
  layout: TableLayout;
  snapshot: MatchSnapshot;
}

const rankValue: Record<Rank, number> = {
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

export function createSuitBoardLayer({ layout, snapshot }: SuitBoardLayerOptions) {
  const root = new Container();
  const boardShell = new Graphics();

  boardShell
    .roundRect(layout.board.x, layout.board.y, layout.board.width, layout.board.height, 28)
    .fill({ color: cardTheme.velvetGlow, alpha: 0.42 })
    .stroke({ color: cardTheme.lineSoft, alpha: 0.72, width: 1 });
  root.addChild(boardShell);

  layout.suitLanes.forEach((lane) => {
    const cards = suitCards(snapshot.layout, lane.key);
    const laneShell = new Graphics();
    const axis = new Graphics();
    const slotGlow = new Graphics();
    const title = new Text({
      style: {
        fill: cardTheme.textMuted,
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: layout.compact ? 12 : 14,
        fontWeight: "700",
      },
      text: lane.label,
    });
    const cardWidth = layout.compact ? 42 : 48;
    const cardHeight = layout.compact ? 60 : 70;
    const cardStep = layout.compact ? 19 : 24;
    const centerCard = createCardView({
      card: { id: `${lane.key}-7`, rank: 7, suit: lane.key },
      height: cardHeight,
      isFaceUp: true,
      isInteractive: false,
      isLegal: false,
      width: cardWidth,
    });

    laneShell
      .roundRect(lane.rect.x + 8, lane.rect.y + 12, lane.rect.width - 16, lane.rect.height - 24, 24)
      .stroke({ color: cardTheme.lineSoft, alpha: 0.38, width: 1 });
    axis
      .roundRect(lane.centerX - 1.5, lane.rect.y + 54, 3, lane.rect.height - 92, 999)
      .fill({ color: cardTheme.lineStrong, alpha: 0.32 });
    slotGlow
      .ellipse(lane.centerX, lane.centerY + 2, cardWidth * 0.72, cardHeight * 0.28)
      .fill({ color: cardTheme.glowLegal, alpha: cards.length === 0 ? 0.11 : 0.08 });
    title.anchor.set(0.5, 0);
    title.position.set(lane.centerX, lane.rect.y + 18);
    centerCard.position.set(lane.centerX - cardWidth / 2, lane.centerY - cardHeight / 2);
    centerCard.alpha = cards.length === 0 ? 0.4 : 1;

    root.addChild(laneShell, axis, slotGlow, title, centerCard);

    const lowCards = cards.filter((card) => rankValue[card.rank] < 7).sort((a, b) => rankValue[b.rank] - rankValue[a.rank]);
    const highCards = cards.filter((card) => rankValue[card.rank] > 7).sort((a, b) => rankValue[a.rank] - rankValue[b.rank]);

    lowCards.forEach((card, index) => {
      const view = createCardView({
        card,
        height: cardHeight,
        isFaceUp: true,
        isInteractive: false,
        isLegal: false,
        width: cardWidth,
      });
      view.position.set(
        lane.centerX - cardWidth / 2,
        lane.centerY - cardHeight / 2 - (index + 1) * cardStep,
      );
      root.addChild(view);
    });

    highCards.forEach((card, index) => {
      const view = createCardView({
        card,
        height: cardHeight,
        isFaceUp: true,
        isInteractive: false,
        isLegal: false,
        width: cardWidth,
      });
      view.position.set(
        lane.centerX - cardWidth / 2,
        lane.centerY - cardHeight / 2 + (index + 1) * cardStep,
      );
      root.addChild(view);
    });
  });

  return root;
}
