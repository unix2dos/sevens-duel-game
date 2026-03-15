import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const { createMatchMock, mockPlaySound } = vi.hoisted(() => ({
  createMatchMock: vi.fn(),
  mockPlaySound: vi.fn(),
}));

vi.mock("../../audio/useSound", () => ({
  useSound: () => ({
    playSound: mockPlaySound,
  }),
}));

vi.mock("../../game/match/engine", async () => {
  const actual = await vi.importActual<typeof import("../../game/match/engine")>(
    "../../game/match/engine",
  );

  return {
    ...actual,
    createMatch: createMatchMock,
    dispatchAiTurn: vi.fn((match) => match),
    dispatchHumanAction: vi.fn((match) => match),
  };
});

vi.mock("../../ui/screens/GameScreen", () => ({
  GameScreen: ({
    onReplay,
    onRestart,
    playerName,
  }: {
    onReplay: () => void;
    onRestart: () => void;
    playerName: string;
  }) => (
    <div>
      <p>当前玩家：{playerName}</p>
      <button onClick={onReplay} type="button">
        再来一局
      </button>
      <button onClick={onRestart} type="button">
        返回首页
      </button>
    </div>
  ),
}));

vi.mock("../../ui/screens/ResultScreen", () => ({
  ResultScreen: () => null,
}));

vi.mock("../../ui/components/RulesDialog", () => ({
  RulesDialog: () => null,
}));

import App from "../../App";

beforeEach(() => {
  createMatchMock.mockReset();
  mockPlaySound.mockReset();
  createMatchMock.mockReturnValue({
    snapshot: {
      difficulty: "normal",
      phase: "finished",
      status: "finished",
      turn: "player",
      winner: "player",
    },
  });
});

it("keeps the player name across replay and when returning home", () => {
  render(<App />);

  fireEvent.change(screen.getByRole("textbox", { name: /玩家姓名/i }), {
    target: { value: "张三" },
  });
  fireEvent.click(screen.getByRole("button", { name: /开始游戏/i }));

  expect(screen.getByText("当前玩家：张三")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "再来一局" }));

  expect(createMatchMock).toHaveBeenCalledTimes(2);
  expect(screen.getByText("当前玩家：张三")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "返回首页" }));

  expect(screen.getByRole("textbox", { name: /玩家姓名/i })).toHaveValue("张三");

  fireEvent.change(screen.getByRole("textbox", { name: /玩家姓名/i }), {
    target: { value: "李四" },
  });
  fireEvent.click(screen.getByRole("button", { name: /开始游戏/i }));

  expect(screen.getByText("当前玩家：李四")).toBeInTheDocument();
});

it("restores the player name after a page refresh but returns to the home screen", () => {
  const firstRender = render(<App />);

  fireEvent.change(screen.getByRole("textbox", { name: /玩家姓名/i }), {
    target: { value: "张三" },
  });
  fireEvent.click(screen.getByRole("button", { name: /开始游戏/i }));

  expect(screen.getByText("当前玩家：张三")).toBeInTheDocument();

  firstRender.unmount();

  render(<App />);

  expect(screen.queryByText("当前玩家：张三")).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /玩家姓名/i })).toHaveValue("张三");
});
