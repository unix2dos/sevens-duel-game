import { Container, Graphics, Rectangle, Text, Ticker } from "pixi.js";

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
  selectedPlayCardId: string | null;
}

function createBorrowChip(
  centerX: number,
  centerY: number,
  onBorrow: () => void,
  compact: boolean,
) {
  const root = new Container();
  const radius = compact ? 56 : 68; // Large circular token
  
  // Outer blurred glow for the token
  const glow = new Graphics();
  glow.circle(0, 0, radius + 14)
      .fill({ color: 0xd4af37, alpha: 1 });

  const outer = new Graphics();
  const inner = new Graphics();
  
  // Luxury dark center with a thick gold rim
  outer
    .circle(0, 0, radius)
    .fill({ color: 0x08120b, alpha: 0.95 }) 
    .stroke({ color: 0xd4af37, alpha: 0.85, width: 2.5 });

  // Inner inset gold ring
  inner
    .circle(0, 0, radius - 6)
    .stroke({ color: 0xd4af37, alpha: 0.35, width: 1 });
    
  const subtitle = new Text({
    style: {
      fill: "#d4af37",
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: compact ? 13 : 15,
      fontWeight: "600",
      letterSpacing: 2,
    },
    text: "无牌可出",
  });
  subtitle.anchor.set(0.5);
  subtitle.position.set(0, -14);
  
  const title = new Text({
    style: {
      fill: "#fff8dc",
      fontFamily: "'Bodoni Moda', serif",
      fontSize: compact ? 18 : 22,
      fontWeight: "700",
      letterSpacing: 1,
      dropShadow: { color: 0x000000, alpha: 0.8, blur: 4, distance: 2 }
    },
    text: "点击借牌",
  });
  title.anchor.set(0.5);
  title.position.set(0, 14);

  root.addChild(glow, outer, inner, subtitle, title);
  root.position.set(centerX, centerY);
  
  root.eventMode = "static";
  root.cursor = "pointer";
  root.hitArea = new Rectangle(-radius, -radius, radius * 2, radius * 2);

  // Interaction feedback
  root.on("pointerover", () => { root.scale.set(1.05); });
  root.on("pointerout", () => { root.scale.set(1); });
  root.on("pointerdown", () => { root.scale.set(0.96); });
  root.on("pointerup", () => { root.scale.set(1.05); });
  root.on("pointertap", onBorrow);

  // Breathing animation
  let time = 0;
  const animateGlow = (ticker: Ticker) => {
    time += ticker.deltaTime * 0.05;
    const breathe = (Math.sin(time) + 1) / 2; // 0 to 1
    glow.alpha = 0.15 + breathe * 0.25; // Pulses between 0.15 and 0.40
    glow.scale.set(1 + breathe * 0.08); // Slight organic expansion
  };
  Ticker.shared.add(animateGlow);
  root.on("destroyed", () => Ticker.shared.remove(animateGlow));

  return root;
}

export function createPlayerHandLayer({
  layout,
  onBorrow,
  onPlayCard,
  snapshot,
  seenCards,
  selectedGiveCardId,
  selectedPlayCardId,
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
  // Relax the scale down floor from 0.75 to 0.85 so cards stay relatively large
  const scaleFactor = isCrowded ? Math.max(0.85, 1 - (totalCards - 13) * 0.015) : 1;
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
    // Globally center on the board layout!
    const centerX = layout.board.x + layout.board.width / 2;
    const centerY = layout.board.y + layout.board.height / 2;
    
    const borrowChip = createBorrowChip(
      centerX,
      centerY,
      onBorrow,
      layout.compact,
    );
    borrowChip.zIndex = 100;
    root.addChild(borrowChip);
  }

  let currentX = startX;
  const positionedCards = sortedHand.map((card, index) => {
    const isLegal = legalIds.has(card.id);
    const isSelectedToGive = card.id === selectedGiveCardId;
    const isSelectedToPlay = card.id === selectedPlayCardId;
    const isSelected = isSelectedToGive || isSelectedToPlay;
    const isInteractive = (canAct && isLegal) || isBorrowing;

    const view = createCardView({
      card,
      height: cardHeight,
      isFaceUp: true,
      isInteractive,
      isSelected,
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
