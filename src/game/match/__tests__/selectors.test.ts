import { describe, expect, it } from "vitest";

import { selectPhaseLabel } from "../selectors";
import type { MatchSnapshot } from "../engine";

const baseSnapshot: MatchSnapshot = {
  cardOwners: {},
  difficulty: "normal",
  eventLog: [{ type: "GAME_STARTED", seed: 7 }],
  hands: {
    player: [],
    opponent: [],
  },
  layout: [],
  phase: "playing",
  rngState: 7,
  seed: 7,
  status: "playing",
  turn: "player",
};

describe("selectPhaseLabel", () => {
  it("returns a dedicated label while a borrow is pending", () => {
    expect(
      selectPhaseLabel({
        ...baseSnapshot,
        borrowRequester: "opponent",
        phase: "borrowing",
      }),
    ).toBe("借牌处理中");
  });
});
