import { render, screen } from "@testing-library/react";

import type { MatchSnapshot } from "../../../game/match/engine";
import { ResultScreen } from "../ResultScreen";

const snapshot: MatchSnapshot = {
  cardOwners: {},
  lastPlayedCards: { player: undefined, opponent: undefined },
  difficulty: "normal",
  eventLog: [
    { type: "GAME_STARTED", seed: 1 },
    { type: "GAME_FINISHED", winner: "player", reason: "played-all" },
  ],
  hands: {
    opponent: [],
    player: [],
  },
  layout: [],
  phase: "finished",
  reason: "played-all",
  rngState: 1,
  seed: 1,
  status: "finished",
  turn: "player",
  winner: "player",
};

it("offers a direct way back to the home screen from results", () => {
  render(
    <ResultScreen
      onBackHome={() => {}}
      onReplay={() => {}}
      playerName="张三"
      snapshot={snapshot}
      title="张三赢了"
    />,
  );

  expect(screen.getByRole("button", { name: "再来一局" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "返回首页" })).toBeInTheDocument();
  expect(screen.getByText(/张三可以立刻再开一局/)).toBeInTheDocument();
});
