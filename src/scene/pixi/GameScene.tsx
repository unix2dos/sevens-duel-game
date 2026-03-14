import { useEffect } from "react";

import { createTableView } from "./TableView";
import { preloadCardTextures } from "./cards/cardSvg";
import { usePixiHost } from "./usePixiHost";
import type { MatchSnapshot } from "../../game/match/engine";
import type { Card } from "../../game/core/types";

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
    let active = true;

    if (!app) {
      return;
    }

    const laneSeeds: Card[] = [
      { id: "seed-spades-7", rank: 7, suit: "spades" },
      { id: "seed-hearts-7", rank: 7, suit: "hearts" },
      { id: "seed-clubs-7", rank: 7, suit: "clubs" },
      { id: "seed-diamonds-7", rank: 7, suit: "diamonds" },
    ];
    const visibleCards = [...matchSnapshot.hands.player, ...matchSnapshot.layout, ...laneSeeds];

    void preloadCardTextures(visibleCards).then(() => {
      if (!active || !appRef.current) {
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
    });

    return () => {
      active = false;
    };
  }, [appRef, difficultyLabel, matchSnapshot, onBorrow, onPlayCard, readyToken, showChildGuidance]);

  return <div className="table-stage table-canvas" data-testid="table-stage" ref={hostRef} />;
}
