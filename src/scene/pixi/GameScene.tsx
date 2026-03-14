import { useEffect } from "react";

import { createTableView } from "./TableView";
import { usePixiHost } from "./usePixiHost";
import type { MatchSnapshot } from "../../game/match/engine";

interface GameSceneProps {
  difficultyLabel: string;
  matchSnapshot: MatchSnapshot;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  showChildGuidance: boolean;
}

export function GameScene({
  difficultyLabel,
  matchSnapshot,
  onBorrow,
  onPlayCard,
  showChildGuidance,
}: GameSceneProps) {
  const { appRef, hostRef, readyToken } = usePixiHost();

  useEffect(() => {
    const app = appRef.current;

    if (!app) {
      return;
    }

    app.stage.removeChildren();
    app.stage.addChild(
      createTableView({
        difficultyLabel,
        height: app.screen.height,
        onBorrow,
        onPlayCard,
        showChildGuidance,
        snapshot: matchSnapshot,
        width: app.screen.width,
      }),
    );
  }, [appRef, difficultyLabel, matchSnapshot, onBorrow, onPlayCard, readyToken, showChildGuidance]);

  return <div className="table-stage table-canvas" data-testid="table-stage" ref={hostRef} />;
}
