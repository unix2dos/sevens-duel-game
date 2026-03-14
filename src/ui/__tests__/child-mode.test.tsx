import { render, screen } from "@testing-library/react";

import { createMatch } from "../../game/match/engine";
import { getForcedCard, shouldAutoBorrow } from "../../game/assists/child-mode";
import { GameScreen } from "../screens/GameScreen";

it("auto-resolves borrow actions in child difficulty when no legal move exists", () => {
  const match = createMatch({
    seed: 7,
    difficulty: "child",
    initialHands: {
      player: ["hearts-3", "clubs-2"],
      opponent: ["spades-7", "diamonds-4"],
    },
  });

  expect(shouldAutoBorrow(match.snapshot)).toBe(true);
});

it("detects a single forced legal card in child difficulty", () => {
  const match = createMatch({
    seed: 7,
    difficulty: "child",
    initialHands: {
      player: ["hearts-3", "spades-7"],
      opponent: ["clubs-7", "diamonds-9"],
    },
  });

  expect(getForcedCard(match.snapshot)?.id).toBe("spades-7");
});

it("shows persistent guidance for legal cards in child difficulty", () => {
  const match = createMatch({
    seed: 7,
    difficulty: "child",
    initialHands: {
      player: ["hearts-3", "spades-7"],
      opponent: ["clubs-7", "diamonds-9"],
    },
  });

  render(
    <GameScreen
      difficultyLabel="儿童"
      matchSnapshot={match.snapshot}
      onBorrow={() => {}}
      onPlayCard={() => {}}
      onRestart={() => {}}
      qualityLabel="自动"
      showChildGuidance
    />,
  );

  expect(screen.getByTestId("guidance-layer")).toBeInTheDocument();
});
