import { render, screen } from "@testing-library/react";

import type { MatchSnapshot } from "../../../game/match/engine";
import { ResultStats } from "../ResultStats";

it("shows a neutral finish reason when a hand reaches zero because of borrowing", () => {
  const snapshot: MatchSnapshot = {
    seed: 1,
    rngState: 1,
    hands: {
      player: [],
      opponent: [],
    },
    layout: [],
    turn: "player",
    phase: "finished",
    status: "finished",
    winner: "player",
    reason: "borrowed-empty",
    cardOwners: {},
    difficulty: "normal",
    eventLog: [
      { type: "GAME_STARTED", seed: 1 },
      { type: "GAME_FINISHED", winner: "player", reason: "borrowed-empty" },
    ],
  };

  render(<ResultStats snapshot={snapshot} />);

  expect(screen.getByText("结束原因：借牌后手牌归零")).toBeInTheDocument();
});
