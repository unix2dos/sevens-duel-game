import { Container, Graphics } from "pixi.js";

import { cardTheme } from "./cards/cardTheme";
import { createTableLayout } from "./layout/tableLayout";
import { createOpponentLayer } from "./layers/OpponentLayer";
import { createPlayerHandLayer } from "./layers/PlayerHandLayer";
import { createSuitBoardLayer } from "./layers/SuitBoardLayer";
import { createTopStatusLayer } from "./layers/TopStatusLayer";
import { createTransientFeedLayer } from "./layers/TransientFeedLayer";
import type { MatchSnapshot } from "../../game/match/engine";
import type { Suit } from "../../game/core/types";

interface TableViewOptions {
  celebratingSuits: Set<Suit>;
  difficultyLabel: string;
  height: number;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  showChildGuidance: boolean;
  snapshot: MatchSnapshot;
  seenCards?: Set<string>;
  selectedGiveCardId: string | null;
  width: number;
}

export function createTableView({
  celebratingSuits,
  difficultyLabel,
  height,
  onBorrow,
  onPlayCard,
  showChildGuidance,
  snapshot,
  seenCards = new Set(),
  selectedGiveCardId,
  width,
}: TableViewOptions) {
  const root = new Container();
  root.sortableChildren = true;
  const layout = createTableLayout(width, height);
  const backdrop = new Graphics();
  const felt = new Graphics();

  backdrop
    .roundRect(0, 0, width, height, 34)
    .fill(cardTheme.velvet)
    .stroke({ color: cardTheme.lineSoft, alpha: 0.5, width: 1 });
  felt
    .roundRect(6, 6, width - 12, height - 12, 30)
    .fill({ color: cardTheme.velvetGlow, alpha: 0.24 });

  root.addChild(backdrop, felt);
  root.addChild(
    createTopStatusLayer({ difficultyLabel, layout, snapshot }),
    createOpponentLayer({ layout, snapshot }),
    createSuitBoardLayer({ celebratingSuits, layout, snapshot, seenCards }),
    createTransientFeedLayer({ layout, showChildGuidance, snapshot }),
    createPlayerHandLayer({ layout, onBorrow, onPlayCard, snapshot, seenCards, selectedGiveCardId }),
  );

  return root;
}
