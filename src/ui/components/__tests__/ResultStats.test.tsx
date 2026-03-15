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
  lastPlayedCards: { player: undefined, opponent: undefined },
    difficulty: "normal",
    eventLog: [
      { type: "GAME_STARTED", seed: 1 },
      { type: "GAME_FINISHED", winner: "player", reason: "borrowed-empty" },
    ],
  };

  render(<ResultStats playerName="张三" snapshot={snapshot} />);

  expect(screen.getByText(/结束原因：借牌后手牌归零/)).toBeInTheDocument();
  expect(screen.getByText(/张三出牌 0 张/)).toBeInTheDocument();
  expect(screen.getByText(/剩余手牌：张三 0 张 · 机器人 0 张/)).toBeInTheDocument();
});
