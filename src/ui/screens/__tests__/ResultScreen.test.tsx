import { render, screen } from "@testing-library/react";

import type { MatchSnapshot } from "../../../game/match/engine";
import { ResultScreen } from "../ResultScreen";

const snapshot: MatchSnapshot = {
  cardOwners: {},
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
  render(<ResultScreen onBackHome={() => {}} onReplay={() => {}} snapshot={snapshot} title="你赢了" />);

  expect(screen.getByRole("button", { name: "再来一局" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "返回首页" })).toBeInTheDocument();
});
