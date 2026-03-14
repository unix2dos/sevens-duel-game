import { useEffect } from "react";

import { createTableView } from "./TableView";
import { usePixiHost } from "./usePixiHost";
import type { MatchSnapshot } from "../../game/match/engine";

interface GameSceneProps {
  matchSnapshot: MatchSnapshot;
  onPlayCard: (cardId: string) => void;
}

export function GameScene({ matchSnapshot, onPlayCard }: GameSceneProps) {
  const { appRef, hostRef } = usePixiHost();

  useEffect(() => {
    const app = appRef.current;

    if (!app) {
      return;
    }

    app.stage.removeChildren();
    app.stage.addChild(
      createTableView({
        height: app.screen.height,
        onPlayCard,
        snapshot: matchSnapshot,
        width: app.screen.width,
      }),
    );
  }, [appRef, matchSnapshot, onPlayCard]);

  return <div className="table-stage table-canvas" data-testid="table-stage" ref={hostRef} />;
}
