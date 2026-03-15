import { startTransition, useEffect, useRef, useState } from "react";

import { difficultyLabels, type DifficultyId, type ScreenId } from "./app/model";
import { qualityLabel, resolveQualityPreset } from "./app/performance";
import { useSound } from "./audio/useSound";
import { getForcedCard, shouldAutoBorrow } from "./game/assists/child-mode";
import { dispatchAiTurn, dispatchHumanAction, type Match, createMatch } from "./game/match/engine";
import { RulesDialog } from "./ui/components/RulesDialog";
import { isValidPlayerName, normalizePlayerName, playerWinTitle } from "./ui/playerText";
import { GameScreen } from "./ui/screens/GameScreen";
import { HomeScreen } from "./ui/screens/HomeScreen";
import { ResultScreen } from "./ui/screens/ResultScreen";
import "./App.css";

const PLAYER_NAME_STORAGE_KEY = "sevens-duel-player-name";

function buildSeed() {
  return Math.floor(Date.now() % 0x100000000);
}

function loadStoredPlayerName() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? "";
}

function App() {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>("normal");
  const [playerName, setPlayerName] = useState(loadStoredPlayerName);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [match, setMatch] = useState<Match | null>(null);
  const previousMatchStatusRef = useRef<Match["snapshot"]["status"] | null>(null);
  const uiSoundOnEnableRef = useRef(false);

  const difficultyLabel = difficultyLabels[selectedDifficulty];
  const performancePreset = resolveQualityPreset();
  const resultTitle =
    match?.snapshot.status === "finished"
      ? match.snapshot.winner === "player"
        ? playerWinTitle(playerName)
        : "机器人获胜"
      : "本局结束";
  const { playSound } = useSound(soundEnabled);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (playerName.length === 0) {
      window.sessionStorage.removeItem(PLAYER_NAME_STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(PLAYER_NAME_STORAGE_KEY, playerName);
  }, [playerName]);

  useEffect(() => {
    if (soundEnabled && uiSoundOnEnableRef.current) {
      uiSoundOnEnableRef.current = false;
      playSound("ui");
    }
  }, [playSound, soundEnabled]);

  useEffect(() => {
    if (!match) {
      previousMatchStatusRef.current = null;
      return;
    }

    const currentStatus = match.snapshot.status;
    const previousStatus = previousMatchStatusRef.current;
    previousMatchStatusRef.current = currentStatus;

    if (screen !== "game" || currentStatus !== "finished" || previousStatus === "finished") {
      return;
    }

    playSound("result");
    // We intentionally do not call setScreen("result") anymore. 
    // The GameScreen will render an in-board completion modal automatically.
  }, [match, playSound, screen]);

  useEffect(() => {
    if (!match || screen !== "game") {
      return;
    }

    if (match.snapshot.status !== "playing" || match.snapshot.turn !== "opponent") {
      return;
    }

    if (match.snapshot.phase === "borrowing") {
      return;
    }

    const timer = window.setTimeout(() => {
      playSound("play");
      setMatch((current) => (current ? dispatchAiTurn(current) : current));
    }, 420);

    return () => window.clearTimeout(timer);
  }, [match, playSound, screen]);

  useEffect(() => {
    if (!match || screen !== "game" || match.snapshot.turn !== "player") {
      return;
    }

    if (shouldAutoBorrow(match.snapshot)) {
      const timer = window.setTimeout(() => {
        playSound("borrow");
        setMatch((current) =>
          current ? dispatchHumanAction(current, { type: "borrow" }) : current,
        );
      }, 260);

      return () => window.clearTimeout(timer);
    }

    const forcedCard = getForcedCard(match.snapshot);

    if (!forcedCard) {
      return;
    }

    const timer = window.setTimeout(() => {
      playSound("play");
      setMatch((current) =>
        current
          ? dispatchHumanAction(current, { cardId: forcedCard.id, type: "play" })
          : current,
      );
    }, 260);

    return () => window.clearTimeout(timer);
  }, [match, playSound, screen]);

  return (
    <>
      {screen === "home" ? (
        <HomeScreen
          onPlayerNameChange={setPlayerName}
          onOpenRules={() => {
            playSound("ui");
            setRulesOpen(true);
          }}
          onSelectDifficulty={setSelectedDifficulty}
          onStart={(nextPlayerName) => {
            if (!isValidPlayerName(nextPlayerName)) {
              return;
            }

            const normalizedPlayerName = normalizePlayerName(nextPlayerName);

            setPlayerName(normalizedPlayerName);
            playSound("deal");
            setMatch(createMatch({ difficulty: selectedDifficulty, seed: buildSeed() }));
            startTransition(() => setScreen("game"));
          }}
          onToggleSound={() => {
            if (soundEnabled) {
              playSound("ui");
              setSoundEnabled(false);
              return;
            }

            uiSoundOnEnableRef.current = true;
            setSoundEnabled(true);
          }}
          playerName={playerName}
          selectedDifficulty={selectedDifficulty}
          soundEnabled={soundEnabled}
        />
      ) : null}

      {screen === "game" && match ? (
        <GameScreen
          key={match.snapshot.seed}
          difficultyLabel={difficultyLabel}
          matchSnapshot={match.snapshot}
          onBorrow={() => {
            playSound("borrow");
            setMatch((current) =>
              current ? dispatchHumanAction(current, { type: "borrow" }) : current,
            );
          }}
          onPlayCard={(cardId) => {
            playSound("play");
            setMatch((current) =>
              current ? dispatchHumanAction(current, { cardId, type: "play" }) : current,
            );
          }}
          onGiveCard={(cardId) => {
            playSound("play");
            setMatch((current) =>
              current ? dispatchHumanAction(current, { cardId, type: "give_card" }) : current,
            );
          }}
          onRestart={() => {
            setMatch(null);
            startTransition(() => setScreen("home"));
          }}
          onReplay={() => {
            playSound("deal");
            setMatch(createMatch({ difficulty: selectedDifficulty, seed: buildSeed() }));
          }}
          playerName={playerName}
          qualityLabel={qualityLabel(performancePreset)}
          showChildGuidance={match.snapshot.difficulty === "child"}
        />
      ) : null}

      {screen === "result" ? (
        <ResultScreen
          onBackHome={() => {
            setMatch(null);
            startTransition(() => setScreen("home"));
          }}
          onReplay={() => {
            playSound("deal");
            setMatch(createMatch({ difficulty: selectedDifficulty, seed: buildSeed() }));
            startTransition(() => setScreen("game"));
          }}
          playerName={playerName}
          snapshot={match?.snapshot ?? null}
          title={resultTitle}
        />
      ) : null}

      <RulesDialog onClose={() => setRulesOpen(false)} open={rulesOpen} />
    </>
  );
}

export default App;
