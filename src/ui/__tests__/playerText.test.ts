import { describe, expect, it } from "vitest";

import {
  actorName,
  gameModalResultCopy,
  gameResultCopy,
  isValidPlayerName,
  normalizePlayerName,
  playerHandLabel,
  playerTurnFeed,
  playerTurnLabel,
  playerWinTitle,
  playerWonRound,
} from "../playerText";

describe("playerText", () => {
  it("trims player names before use", () => {
    expect(normalizePlayerName("  张三  ")).toBe("张三");
  });

  it("treats whitespace-only input as invalid", () => {
    expect(isValidPlayerName("   ")).toBe(false);
    expect(isValidPlayerName("张三")).toBe(true);
  });

  it("formats player-facing labels with the player name", () => {
    expect(playerHandLabel("张三")).toBe("张三的手牌");
    expect(playerTurnLabel("张三")).toBe("张三的回合");
    expect(playerTurnFeed("张三")).toBe("轮到张三出牌");
    expect(playerWinTitle("张三")).toBe("张三赢了");
    expect(playerWonRound("张三")).toBe("张三赢下这一局");
  });

  it("keeps robot labels unchanged", () => {
    expect(actorName("player", "张三")).toBe("张三");
    expect(actorName("opponent", "张三")).toBe("机器人");
  });

  it("formats result copy with the player name", () => {
    expect(gameResultCopy("张三")).toContain("张三可以立刻再开一局");
    expect(gameModalResultCopy("张三")).toContain("张三可以立刻再开一局");
  });
});
