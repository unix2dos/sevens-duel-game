import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

import { createTableView } from "./TableView";
import type { TableViewRoot } from "./TableView";
import { preloadCardFaceTexture, preloadCardTextures } from "./cards/cardSvg";
import { updateSuitCelebrations } from "./suitCelebration";
import { usePixiHost } from "./usePixiHost";
import type { MatchSnapshot } from "../../game/match/engine";
import type { Card, Suit } from "../../game/core/types";

export interface GameSceneRef {
  playEndGameVFX: () => Promise<void>;
  updateTimerText: (time: number | null) => void;
}

interface GameSceneProps {
  difficultyLabel: string;
  matchSnapshot: MatchSnapshot;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  playerName: string;
  selectedGiveCardId: string | null;
  selectedPlayCardId: string | null;
  showChildGuidance: boolean;
  isHintActive?: boolean;
}

export const GameScene = forwardRef<GameSceneRef, GameSceneProps>(({
  difficultyLabel,
  matchSnapshot,
  onBorrow,
  onPlayCard,
  playerName,
  selectedGiveCardId,
  selectedPlayCardId,
  showChildGuidance,
  isHintActive,
}, ref) => {
  const { appRef, hostRef, readyToken, resizeToken } = usePixiHost();
  const seenCardsRef = useRef(new Set<string>());
  const previousLayoutRef = useRef<Card[] | null>(null);
  const celebrationStartTimesRef = useRef(new Map<Suit, number>());
  const timerRef = useRef<number | null>(null);
  const hasPlayedVFXRef = useRef(false);

  useImperativeHandle(ref, () => ({
    playEndGameVFX: async () => {
      if (!appRef.current || hasPlayedVFXRef.current) return;
      hasPlayedVFXRef.current = true;
      
      try {
        const { playVictoryVFX } = await import("./vfx/VictoryVFX");
        const { playDefeatVFX } = await import("./vfx/DefeatVFX");
        
        if (matchSnapshot.winner === "player") {
          await playVictoryVFX(appRef.current.stage, appRef.current.screen.width, appRef.current.screen.height);
        } else {
          await playDefeatVFX(appRef.current.stage, appRef.current.screen.width, appRef.current.screen.height);
        }
      } catch (err) {
        console.error("VFX Error:", err);
      }
    },
    updateTimerText: (time: number | null) => {
      timerRef.current = time;
      if (appRef.current) {
        const root = appRef.current.stage.children[0] as TableViewRoot | undefined;
        if (root) {
          root.updateTimerText(time);
        }
      }
    }
  }));

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
    const celebrationStartTimes = updateSuitCelebrations(
      celebrationStartTimesRef.current,
      previousLayoutRef.current,
      matchSnapshot.layout,
      Date.now(),
    );

    celebrationStartTimesRef.current = celebrationStartTimes;
    previousLayoutRef.current = matchSnapshot.layout;

    void Promise.all([
      preloadCardTextures(visibleCards),
      ...laneSeeds.map((card) => preloadCardFaceTexture(card, "suit-emblem")),
    ]).then(() => {
      if (!active || !appRef.current) {
        return;
      }

      app.stage.removeChildren().forEach((child) => child.destroy({ children: true }));
      const tableRoot = createTableView({
        celebrationStartTimes,
        difficultyLabel,
        height: app.screen.height,
        onBorrow,
        onPlayCard,
        playerName,
        selectedGiveCardId,
        selectedPlayCardId,
        showChildGuidance,
        snapshot: matchSnapshot,
        seenCards: seenCardsRef.current,
        width: app.screen.width,
        isHintActive,
      });

      app.stage.addChild(tableRoot);

      if (timerRef.current !== null) {
        tableRoot.updateTimerText(timerRef.current);
      }

      visibleCards.forEach((card) => seenCardsRef.current.add(card.id));
    });

    return () => {
      active = false;
    };
  }, [appRef, difficultyLabel, matchSnapshot, onBorrow, onPlayCard, playerName, readyToken, resizeToken, selectedGiveCardId, selectedPlayCardId, showChildGuidance, isHintActive]);

  return <div className="table-stage table-canvas" data-testid="table-stage" ref={hostRef} />;
});
