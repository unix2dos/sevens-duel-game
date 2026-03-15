import { Container, Graphics } from "pixi.js";

import { createTableLayout } from "./layout/tableLayout";
import { createOpponentLayer } from "./layers/OpponentLayer";
import { createPlayerHandLayer } from "./layers/PlayerHandLayer";
import { createSuitBoardLayer } from "./layers/SuitBoardLayer";
import { createTopStatusLayer } from "./layers/TopStatusLayer";
import { createTransientFeedLayer } from "./layers/TransientFeedLayer";
import type { MatchSnapshot } from "../../game/match/engine";
import type { Suit } from "../../game/core/types";

interface TableViewOptions {
  celebrationStartTimes: Map<Suit, number>;
  difficultyLabel: string;
  height: number;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  playerName: string;
  showChildGuidance: boolean;
  snapshot: MatchSnapshot;
  seenCards?: Set<string>;
  selectedGiveCardId: string | null;
  selectedPlayCardId: string | null;
  width: number;
}

export function createTableView({
  celebrationStartTimes,
  difficultyLabel,
  height,
  onBorrow,
  onPlayCard,
  playerName,
  showChildGuidance,
  snapshot,
  seenCards = new Set(),
  selectedGiveCardId,
  selectedPlayCardId,
  width,
}: TableViewOptions) {
  const root = new Container();
  root.sortableChildren = true;
  const layout = createTableLayout(width, height);
  const backdrop = new Graphics();
  const felt = new Graphics();

  // Create absolute luxury vignette and velvet depth
  backdrop
    .roundRect(0, 0, width, height, 34)
    .fill({ color: 0x071b0e, alpha: 1 }) // Deep base green-black
    .stroke({ color: 0x1a3d24, alpha: 0.8, width: 1 });
    
  felt
    .roundRect(6, 6, width - 12, height - 12, 30)
    // Rich gradient for center highlight 
    .fill({ color: 0x1f5c36, alpha: 0.45 })
    .stroke({ color: 0x2e7547, alpha: 0.15, width: 2 });

  root.addChild(backdrop, felt);
  root.addChild(
    createTopStatusLayer({ difficultyLabel, layout, playerName, snapshot }),
    createOpponentLayer({ layout, snapshot }),
    createSuitBoardLayer({ celebrationStartTimes, layout, snapshot, seenCards }),
    createTransientFeedLayer({ layout, playerName, showChildGuidance, snapshot }),
    createPlayerHandLayer({ layout, onBorrow, onPlayCard, playerName, snapshot, seenCards, selectedGiveCardId, selectedPlayCardId }),
  );

  return root;
}
