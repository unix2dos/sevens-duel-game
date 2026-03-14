import { startTransition, useEffect, useState } from "react";

import { difficultyLabels, type DifficultyId, type ScreenId } from "./app/model";
import { qualityLabel, resolveQualityPreset } from "./app/performance";
import { useSound } from "./audio/useSound";
import { getForcedCard, shouldAutoBorrow } from "./game/assists/child-mode";
import { dispatchAiTurn, dispatchHumanAction, type Match, createMatch } from "./game/match/engine";
import { RulesDialog } from "./ui/components/RulesDialog";
import { GameScreen } from "./ui/screens/GameScreen";
import { HomeScreen } from "./ui/screens/HomeScreen";
import { ResultScreen } from "./ui/screens/ResultScreen";
import "./App.css";

function buildSeed() {
  return Math.floor(Date.now() % 0x100000000);
}

function App() {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>("normal");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [match, setMatch] = useState<Match | null>(null);

  const difficultyLabel = difficultyLabels[selectedDifficulty];
  const performancePreset = resolveQualityPreset();
  const resultTitle =
    match?.snapshot.status === "finished"
      ? match.snapshot.winner === "player"
        ? "你赢了"
        : "AI 获胜"
      : "本局结束";
  const { playSound } = useSound(soundEnabled);

  useEffect(() => {
    if (!match || screen !== "game") {
      return;
    }

    if (match.snapshot.status === "finished") {
      startTransition(() => setScreen("result"));
      return;
    }

    if (match.snapshot.turn !== "opponent") {
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
          onOpenRules={() => setRulesOpen(true)}
          onSelectDifficulty={setSelectedDifficulty}
          onStart={() => {
            playSound("ui");
            setMatch(createMatch({ difficulty: selectedDifficulty, seed: buildSeed() }));
            startTransition(() => setScreen("game"));
          }}
          onToggleSound={() => setSoundEnabled((value) => !value)}
          selectedDifficulty={selectedDifficulty}
          soundEnabled={soundEnabled}
        />
      ) : null}

      {screen === "game" && match ? (
        <GameScreen
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
          onRestart={() => {
            setMatch(null);
            startTransition(() => setScreen("home"));
          }}
          qualityLabel={qualityLabel(performancePreset)}
          showChildGuidance={match.snapshot.difficulty === "child"}
        />
      ) : null}

      {screen === "result" ? (
        <ResultScreen
          onReplay={() => {
            playSound("deal");
            setMatch(createMatch({ difficulty: selectedDifficulty, seed: buildSeed() }));
            startTransition(() => setScreen("game"));
          }}
          title={resultTitle}
        />
      ) : null}

      <RulesDialog onClose={() => setRulesOpen(false)} open={rulesOpen} />
    </>
  );
}

export default App;
