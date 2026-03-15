import { render, screen } from "@testing-library/react";

import { createMatch } from "../../game/match/engine";
import { getForcedCard, shouldAutoBorrow } from "../../game/assists/child-mode";
import { GameScreen } from "../screens/GameScreen";

it("does not auto-borrow in child difficulty when no legal move exists", () => {
  const match = createMatch({
    seed: 7,
    difficulty: "child",
    initialHands: {
      player: ["hearts-3", "clubs-2"],
      opponent: ["spades-7", "diamonds-4"],
    },
  });

  expect(shouldAutoBorrow(match.snapshot)).toBe(false);
});

it("does not force a single legal card in child difficulty", () => {
  const match = createMatch({
    seed: 7,
    difficulty: "child",
    initialHands: {
      player: ["hearts-3", "spades-7"],
      opponent: ["clubs-7", "diamonds-9"],
    },
  });

  expect(getForcedCard(match.snapshot)).toBeNull();
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
      onGiveCard={() => {}}
      onRestart={() => {}}
      onReplay={() => {}}
      qualityLabel="自动"
      showChildGuidance
    />,
  );

  expect(screen.getByRole("region", { name: /对局牌桌，儿童/i })).toBeInTheDocument();
  expect(screen.getByTestId("table-stage")).toBeInTheDocument();
});

it("removes the old dom-based action rack from the gameplay screen", () => {
  const match = createMatch({
    seed: 7,
    difficulty: "normal",
    initialHands: {
      player: ["hearts-3", "spades-K", "clubs-7"],
      opponent: ["diamonds-7", "clubs-9"],
    },
  });

  render(
    <GameScreen
      difficultyLabel="标准"
      matchSnapshot={match.snapshot}
      onBorrow={() => {}}
      onPlayCard={() => {}}
      onGiveCard={() => {}}
      onRestart={() => {}}
      onReplay={() => {}}
      qualityLabel="高"
      showChildGuidance={false}
    />,
  );

  expect(screen.getByTestId("table-stage")).toBeInTheDocument();
  expect(screen.queryByText(/当前可打/i)).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: /玩家控制台/i })).not.toBeInTheDocument();
});
