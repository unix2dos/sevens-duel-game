import { Container, Graphics, Text } from "pixi.js";

import { createCardView } from "../CardView";
import { cardTheme } from "../cards/cardTheme";
import type { TableLayout } from "../layout/tableLayout";
import { CARD_FLIP_DELAY_STEP_MS } from "../suitCelebration";
import type { MatchSnapshot } from "../../../game/match/engine";
import type { Card, Suit } from "../../../game/core/types";
import { visualRankValue } from "../../../game/core/visualRank";

interface SuitBoardLayerOptions {
  celebrationStartTimes?: Map<Suit, number>;
  layout: TableLayout;
  snapshot: MatchSnapshot;
  seenCards: Set<string>;
}

function suitCards(layout: Card[], suit: Suit) {
  return layout
    .filter((card) => card.suit === suit)
    .sort((left, right) => visualRankValue[left.rank] - visualRankValue[right.rank]);
}

export function createSuitBoardLayer({
  celebrationStartTimes = new Map<Suit, number>(),
  layout,
  snapshot,
  seenCards,
}: SuitBoardLayerOptions) {
  const root = new Container();
  root.sortableChildren = true;
  const boardShell = new Graphics();

  boardShell
    .roundRect(layout.board.x, layout.board.y, layout.board.width, layout.board.height, 28)
    .fill({ color: cardTheme.velvetGlow, alpha: 0.42 })
    .stroke({ color: cardTheme.lineSoft, alpha: 0.72, width: 1 });
  root.addChild(boardShell);

  layout.suitLanes.forEach((lane) => {
    const cards = suitCards(snapshot.layout, lane.key);
    const flipStartTime = celebrationStartTimes.get(lane.key) ?? 0;
    const replayFlip = flipStartTime > 0;
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
    const lowCards = cards
      .filter((card) => visualRankValue[card.rank] < 7)
      .sort((a, b) => visualRankValue[b.rank] - visualRankValue[a.rank]);
    const highCards = cards
      .filter((card) => visualRankValue[card.rank] > 7)
      .sort((a, b) => visualRankValue[a.rank] - visualRankValue[b.rank]);
    const centerCardData = cards.find((card) => visualRankValue[card.rank] === 7) ?? {
      id: `seed-${lane.key}-7`,
      rank: 7,
      suit: lane.key,
    };
    const centerIsPlaceholder = centerCardData.id.startsWith("seed-");

    // Dynamically calculate card height within lane constraints
    const paddingY = layout.compact ? 12 : 20;
    const availableLaneHeight = layout.board.height - paddingY * 2;
    const baseCardHeight = lane.rect.width * 1.5 - (layout.compact ? 16 : 24);
    const cardHeight = Math.max(layout.compact ? 60 : 76, Math.min(baseCardHeight, availableLaneHeight * 0.45));
    const cardWidth = cardHeight * 0.714; // exact poker card ratio (2.5/3.5)
    
    // Fixed visual tight safe spacing (A) - exactly fits the index.
    const fixedStep = Math.max(layout.compact ? 16 : 22, cardHeight * 0.15);
    const centerCard = createCardView({
      card: centerCardData,
      height: cardHeight,
      isInteractive: false,
      isFaceUp: true,
      isLegal: false,
      animateEntrance: !replayFlip && !seenCards.has(centerCardData.id),
      faceVariant: centerIsPlaceholder ? "suit-emblem" : undefined,
      owner: centerIsPlaceholder ? undefined : snapshot.cardOwners[centerCardData.id],
      replayFlip,
      flipDelay: 0,
      flipStartTime,
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
    centerCard.zIndex = 7;

    root.addChild(laneShell, axis, slotGlow, title, centerCard);

    lowCards.forEach((card, index) => {
      const view = createCardView({
        card,
        height: cardHeight,
        isInteractive: false,
        isFaceUp: true,
        isLegal: false,
        animateEntrance: !replayFlip && !seenCards.has(card.id),
        owner: snapshot.cardOwners[card.id],
        replayFlip,
        flipDelay: Math.abs(visualRankValue[card.rank] - 7) * CARD_FLIP_DELAY_STEP_MS,
        flipStartTime,
        width: cardWidth,
      });
      view.position.set(
        lane.centerX - cardWidth / 2,
        lane.centerY - cardHeight / 2 - (index + 1) * fixedStep,
      );
      view.zIndex = visualRankValue[card.rank];
      root.addChild(view);
    });

    highCards.forEach((card, index) => {
      const view = createCardView({
        card,
        height: cardHeight,
        isInteractive: false,
        isFaceUp: true,
        isLegal: false,
        animateEntrance: !replayFlip && !seenCards.has(card.id),
        owner: snapshot.cardOwners[card.id],
        replayFlip,
        flipDelay: Math.abs(visualRankValue[card.rank] - 7) * CARD_FLIP_DELAY_STEP_MS,
        flipStartTime,
        width: cardWidth,
      });
      view.position.set(
        lane.centerX - cardWidth / 2,
        lane.centerY - cardHeight / 2 + (index + 1) * fixedStep,
      );
      view.zIndex = visualRankValue[card.rank];
      root.addChild(view);
    });
  });

  return root;
}
