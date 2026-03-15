import { Container, Graphics, Rectangle, Text } from "pixi.js";

import { createCardView } from "../CardView";
import { cardTheme } from "../cards/cardTheme";
import type { TableLayout } from "../layout/tableLayout";
import type { MatchSnapshot } from "../../../game/match/engine";
import { selectLegalCards } from "../../../game/match/selectors";
import { sortCardsForDisplay } from "../../../ui/cardPresentation";

interface PlayerHandLayerOptions {
  layout: TableLayout;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  snapshot: MatchSnapshot;
  seenCards: Set<string>;
  selectedGiveCardId: string | null;
}

function createBorrowChip(
  x: number,
  y: number,
  width: number,
  onBorrow: () => void,
  compact: boolean,
) {
  const root = new Container();
  const shell = new Graphics();
  const title = new Text({
    style: {
      fill: "#612c00",
      fontFamily: "Sora, IBM Plex Sans, sans-serif",
      fontSize: compact ? 14 : 15,
      fontWeight: "800",
    },
    text: "无牌可出 · 点击借牌",
  });

  shell
    .roundRect(x, y, width, compact ? 44 : 48, 999)
    .fill({ color: 0xf59e0b, alpha: 1 })
    .stroke({ color: 0xb45309, alpha: 0.6, width: 2 });
  title.anchor.set(0.5);
  title.position.set(x + width / 2, y + (compact ? 22 : 24));
  root.addChild(shell, title);
  root.eventMode = "static";
  root.cursor = "pointer";
  root.hitArea = new Rectangle(x, y, width, compact ? 44 : 48);
  root.on("pointertap", onBorrow);

  return root;
}


export function createPlayerHandLayer({
  layout,
  onBorrow,
  onPlayCard,
  snapshot,
  seenCards,
  selectedGiveCardId,
}: PlayerHandLayerOptions) {
  const root = new Container();
  root.zIndex = 50; // Ensure hand layer (and its borrow chip) renders above board
  root.sortableChildren = true;
  const shell = new Graphics();
  const label = new Text({
    style: {
      fill: cardTheme.textMuted,
      fontFamily: "IBM Plex Sans, sans-serif",
      fontSize: 12,
      fontWeight: "600",
    },
    text: "你的手牌",
  });
  const count = new Text({
    style: {
      fill: cardTheme.textMuted,
      fontFamily: "IBM Plex Sans, sans-serif",
      fontSize: 11,
      fontWeight: "600",
    },
    text: `${snapshot.hands.player.length} 张`,
  });
  const sortedHand = sortCardsForDisplay(snapshot.hands.player);
  const legalIds = new Set(selectLegalCards(snapshot).map((card) => card.id));
  const canAct = snapshot.turn === "player" && snapshot.status === "playing";
  const isBorrowing = snapshot.phase === "borrowing" && snapshot.borrowRequester === "opponent";
  const showBorrowChip = canAct && legalIds.size === 0 && !isBorrowing;
  const availableWidth = layout.handRail.width - 32;
  const availableHeight = layout.handRail.height - 36; // Padding top/bottom

  // Dynamic scaling for large hand sizes to prevent extreme squeezing
  const totalCards = sortedHand.length;
  const isCrowded = totalCards > 13;
  const scaleFactor = isCrowded ? Math.max(0.75, 1 - (totalCards - 13) * 0.02) : 1;
  const computedCardHeight = Math.min(availableHeight, availableWidth * 1.4) * scaleFactor;
  
  const cardHeight = Math.max(layout.compact ? 78 : 96, computedCardHeight);
  const cardWidth = cardHeight * 0.714; // Slightly wider than 0.7 for poker cards
  const groupGap = layout.compact ? 6 : (10 * scaleFactor);
  const suitGapTotal = sortedHand.reduce((sum, card, index) => {
    if (index === 0 || sortedHand[index - 1]?.suit === card.suit) {
      return sum;
    }

    return sum + groupGap;
  }, 0);
  
  // Calculate step, ensuring minimum visibility of card edges
  const minStep = layout.compact ? 16 : 22; 
  const availableStepSpace = availableWidth - cardWidth - suitGapTotal;
  const rawStep = totalCards > 1 ? availableStepSpace / (totalCards - 1) : cardWidth;
  
  // If the raw step is too small, we force the minimum step, which may overflow the available width slightly
  // but guarantees visibility. In extreme cases, the hand container just overflows left/right.
  const step = Math.max(minStep, Math.min(cardWidth * (layout.compact ? 0.48 : 0.66), rawStep));
  
  const groupWidth = cardWidth + Math.max(0, totalCards - 1) * step + suitGapTotal;
  const startX = layout.handRail.x + (layout.handRail.width - groupWidth) / 2;
  const baselineY = layout.handRail.y + layout.handRail.height - cardHeight - (layout.compact ? 14 : 18);

  shell
    .roundRect(layout.handRail.x, layout.handRail.y, layout.handRail.width, layout.handRail.height, 24)
    .fill({ color: cardTheme.velvetGlow, alpha: 0.5 })
    .stroke({ color: cardTheme.lineSoft, alpha: 0.72, width: 1 });
  label.position.set(layout.handRail.x + 18, layout.handRail.y + 12);
  count.position.set(layout.handRail.x + layout.handRail.width - count.width - 18, layout.handRail.y + 13);
  root.addChild(shell, label, count);
  if (showBorrowChip) {
    const chipY = layout.toastAnchor.y + (layout.compact ? 68 : 52);
    const borrowChip = createBorrowChip(
      layout.toastAnchor.x - 92,
      chipY,
      184,
      onBorrow,
      layout.compact,
    );
    borrowChip.zIndex = 10;
    root.addChild(borrowChip);
  }

  let currentX = startX;
  const positionedCards = sortedHand.map((card, index) => {
    const isLegal = legalIds.has(card.id);
    const isSelected = card.id === selectedGiveCardId;
    const isInteractive = (canAct && isLegal) || isBorrowing;

    const view = createCardView({
      card,
      height: cardHeight,
      isFaceUp: true,
      isInteractive,
      isLegal: isLegal || isBorrowing,
      onPress: onPlayCard,
      animateEntrance: !seenCards.has(card.id),
      width: cardWidth,
    });
    if (index > 0 && sortedHand[index - 1]?.suit !== card.suit) {
      currentX += groupGap;
    }

    const x = currentX;
    // Increase selected pop-up height drastically to stand out of the thick deck
    const y = baselineY - (isSelected ? 36 : isInteractive ? 16 : 0);
    currentX += step;

    view.position.set(x, y);
    // Extra elevation for hovered/selected components.
    view.zIndex = isSelected ? 10 : isInteractive ? 3 : 1;

    if (isInteractive) {
      view.hitArea = new Rectangle(-12, -24, Math.max(cardWidth + 24, step + 24), cardHeight + 36);
    }

    return view;
  });

  positionedCards
    .filter((view) => view.zIndex === 1)
    .forEach((view) => root.addChild(view));
  positionedCards
    .filter((view) => view.zIndex > 1)
    .forEach((view) => root.addChild(view));

  return root;
}
