import { Container, Graphics } from "pixi.js";

import { createTableLayout } from "./layout/tableLayout";
import { createOpponentLayer } from "./layers/OpponentLayer";
import { createPlayerHandLayer } from "./layers/PlayerHandLayer";
import { createSuitBoardLayer } from "./layers/SuitBoardLayer";
import { createTopStatusLayer } from "./layers/TopStatusLayer";
import { createTransientFeedLayer } from "./layers/TransientFeedLayer";
import type { TransientFeedLayerContainer } from "./layers/TransientFeedLayer";
import type { MatchSnapshot } from "../../game/match/engine";
import type { Suit } from "../../game/core/types";

export type TableViewRoot = Container & {
  updateTimerText: (time: number | null) => void;
};

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
  isHintActive?: boolean;
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
  isHintActive,
}: TableViewOptions) {
  const root = new Container() as TableViewRoot;
  root.sortableChildren = true;
  const layout = createTableLayout(width, height);
  const backdrop = new Graphics();
  const felt = new Graphics();

  // Create absolute luxury vignette and velvet depth
  backdrop
    .roundRect(0, 0, width, height, 34)
    .fill({ color: 0x071b0e, alpha: 1 }); // Deep base green-black
    
  felt
    .roundRect(6, 6, width - 12, height - 12, 30)
    // Rich gradient for center highlight 
    .fill({ color: 0x1f5c36, alpha: 0.45 });

  root.addChild(backdrop, felt);
  const feedLayer = createTransientFeedLayer({ layout, playerName, showChildGuidance, snapshot }) as TransientFeedLayerContainer;
  
  root.addChild(
    createTopStatusLayer({ difficultyLabel, layout, playerName, snapshot }),
    createOpponentLayer({ layout, snapshot }),
    createSuitBoardLayer({ celebrationStartTimes, layout, snapshot, seenCards }),
    feedLayer,
    createPlayerHandLayer({ layout, onBorrow, onPlayCard, playerName, snapshot, seenCards, selectedGiveCardId, selectedPlayCardId, isHintActive }),
  );

  root.updateTimerText = (time: number | null) => {
    feedLayer.updateTimerText(time);
  };

  return root;
}
