import { Container, Graphics } from "pixi.js";

import { cardTheme } from "./cards/cardTheme";
import { createTableLayout } from "./layout/tableLayout";
import { createOpponentLayer } from "./layers/OpponentLayer";
import { createPlayerHandLayer } from "./layers/PlayerHandLayer";
import { createSuitBoardLayer } from "./layers/SuitBoardLayer";
import { createTopStatusLayer } from "./layers/TopStatusLayer";
import { createTransientFeedLayer } from "./layers/TransientFeedLayer";
import type { MatchSnapshot } from "../../game/match/engine";

interface TableViewOptions {
  difficultyLabel: string;
  height: number;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  showChildGuidance: boolean;
  snapshot: MatchSnapshot;
  width: number;
}

export function createTableView({
  difficultyLabel,
  height,
  onBorrow,
  onPlayCard,
  showChildGuidance,
  snapshot,
  width,
}: TableViewOptions) {
  const root = new Container();
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
    createSuitBoardLayer({ layout, snapshot }),
    createTransientFeedLayer({ layout, showChildGuidance, snapshot }),
    createPlayerHandLayer({ layout, onBorrow, onPlayCard, snapshot }),
  );

  return root;
}
