import { useEffect, useRef } from "react";

import { createTableView } from "./TableView";
import { preloadCardFaceTexture, preloadCardTextures } from "./cards/cardSvg";
import { updateSuitCelebrations, SUIT_CELEBRATION_DURATION_MS } from "./suitCelebration";
import { usePixiHost } from "./usePixiHost";
import type { MatchSnapshot } from "../../game/match/engine";
import type { Card, Suit } from "../../game/core/types";

interface GameSceneProps {
  difficultyLabel: string;
  matchSnapshot: MatchSnapshot;
  onBorrow: () => void;
  onPlayCard: (cardId: string) => void;
  onEndGameVFXComplete?: () => void;
  playerName: string;
  selectedGiveCardId: string | null;
  selectedPlayCardId: string | null;
  showChildGuidance: boolean;
  isHintActive?: boolean;
}

export function GameScene({
  difficultyLabel,
  matchSnapshot,
  onBorrow,
  onPlayCard,
  onEndGameVFXComplete,
  playerName,
  selectedGiveCardId,
  selectedPlayCardId,
  showChildGuidance,
  isHintActive,
}: GameSceneProps) {
  const { appRef, hostRef, readyToken } = usePixiHost();
  const seenCardsRef = useRef(new Set<string>());
  const previousLayoutRef = useRef<Card[] | null>(null);
  const celebrationStartTimesRef = useRef(new Map<Suit, number>());
  const hasTriggeredVFXRef = useRef(false);

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

    // Check if we need to schedule VFX for the VERY FIRST time
    let maxCelebrationTime = 0;
    if (matchSnapshot.status === "finished" && !hasTriggeredVFXRef.current) {
      hasTriggeredVFXRef.current = true;
      celebrationStartTimes.forEach((startTime) => {
        const timeRemaining = (startTime + SUIT_CELEBRATION_DURATION_MS) - Date.now();
        if (timeRemaining > maxCelebrationTime) {
          maxCelebrationTime = timeRemaining;
        }
      });
      // Import VFX dynamically to avoid blocking basic render
      setTimeout(async () => {
        if (!active || !appRef.current) return;
        const { playVictoryVFX } = await import("./vfx/VictoryVFX");
        const { playDefeatVFX } = await import("./vfx/DefeatVFX");
        
        if (matchSnapshot.winner === "player") {
          await playVictoryVFX(appRef.current.stage, appRef.current.screen.width, appRef.current.screen.height);
        } else {
          await playDefeatVFX(appRef.current.stage, appRef.current.screen.width, appRef.current.screen.height);
        }
        
        if (active && onEndGameVFXComplete) {
          onEndGameVFXComplete();
        }
      }, Math.max(0, maxCelebrationTime));
    }

    // Reset VFX trigger on a new game
    if (matchSnapshot.status !== "finished") {
      hasTriggeredVFXRef.current = false;
    }

    void Promise.all([
      preloadCardTextures(visibleCards),
      ...laneSeeds.map((card) => preloadCardFaceTexture(card, "suit-emblem")),
    ]).then(() => {
      if (!active || !appRef.current) {
        return;
      }

      app.stage.removeChildren().forEach((child) => child.destroy({ children: true }));
      app.stage.addChild(
        createTableView({
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
        }),
      );

      visibleCards.forEach((card) => seenCardsRef.current.add(card.id));
    });

    return () => {
      active = false;
    };
  }, [appRef, difficultyLabel, matchSnapshot, onBorrow, onPlayCard, onEndGameVFXComplete, playerName, readyToken, selectedGiveCardId, selectedPlayCardId, showChildGuidance]);

  return <div className="table-stage table-canvas" data-testid="table-stage" ref={hostRef} />;
}
