import { startTransition, useEffect, useState } from "react";

import { difficultyLabels, type DifficultyId, type ScreenId } from "./app/model";
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
  const resultTitle =
    match?.snapshot.status === "finished"
      ? match.snapshot.winner === "player"
        ? "你赢了"
        : "AI 获胜"
      : "本局结束";

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
      setMatch((current) => (current ? dispatchAiTurn(current) : current));
    }, 420);

    return () => window.clearTimeout(timer);
  }, [match, screen]);

  return (
    <>
      {screen === "home" ? (
        <HomeScreen
          onOpenRules={() => setRulesOpen(true)}
          onSelectDifficulty={setSelectedDifficulty}
          onStart={() => {
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
            setMatch((current) =>
              current ? dispatchHumanAction(current, { type: "borrow" }) : current,
            );
          }}
          onPlayCard={(cardId) => {
            setMatch((current) =>
              current ? dispatchHumanAction(current, { cardId, type: "play" }) : current,
            );
          }}
          onRestart={() => {
            setMatch(null);
            startTransition(() => setScreen("home"));
          }}
        />
      ) : null}

      {screen === "result" ? (
        <ResultScreen
          onReplay={() => {
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
