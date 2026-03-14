import { useEffect } from "react";

import { createTableView } from "./TableView";
import { usePixiHost } from "./usePixiHost";
import type { MatchSnapshot } from "../../game/match/engine";

interface GameSceneProps {
  matchSnapshot: MatchSnapshot;
}

export function GameScene({ matchSnapshot }: GameSceneProps) {
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
        snapshot: matchSnapshot,
        width: app.screen.width,
      }),
    );
  }, [appRef, matchSnapshot]);

  return <div className="table-stage table-canvas" data-testid="table-stage" ref={hostRef} />;
}
