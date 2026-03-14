import { startTransition, useState } from "react";

import { difficultyLabels, type DifficultyId, type ScreenId } from "./app/model";
import { RulesDialog } from "./ui/components/RulesDialog";
import { GameScreen } from "./ui/screens/GameScreen";
import { HomeScreen } from "./ui/screens/HomeScreen";
import { ResultScreen } from "./ui/screens/ResultScreen";
import "./App.css";

function App() {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>("normal");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const difficultyLabel = difficultyLabels[selectedDifficulty];

  return (
    <>
      {screen === "home" ? (
        <HomeScreen
          onOpenRules={() => setRulesOpen(true)}
          onSelectDifficulty={setSelectedDifficulty}
          onStart={() => startTransition(() => setScreen("game"))}
          onToggleSound={() => setSoundEnabled((value) => !value)}
          selectedDifficulty={selectedDifficulty}
          soundEnabled={soundEnabled}
        />
      ) : null}

      {screen === "game" ? (
        <GameScreen
          difficultyLabel={difficultyLabel}
          onRestart={() => startTransition(() => setScreen("home"))}
        />
      ) : null}

      {screen === "result" ? (
        <ResultScreen
          onReplay={() => startTransition(() => setScreen("game"))}
          title="本局结束"
        />
      ) : null}

      <RulesDialog onClose={() => setRulesOpen(false)} open={rulesOpen} />
    </>
  );
}

export default App;
