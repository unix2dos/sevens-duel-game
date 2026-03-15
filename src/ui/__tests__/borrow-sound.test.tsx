import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

const {
  createMatchMock,
  dispatchAiTurnMock,
  dispatchHumanActionMock,
  mockPlaySound,
} = vi.hoisted(() => ({
  createMatchMock: vi.fn(),
  dispatchAiTurnMock: vi.fn(),
  dispatchHumanActionMock: vi.fn(),
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
    dispatchAiTurn: dispatchAiTurnMock,
    dispatchHumanAction: dispatchHumanActionMock,
  };
});

vi.mock("../../ui/screens/HomeScreen", () => ({
  HomeScreen: ({ onStart }: { onStart: () => void }) => (
    <button onClick={onStart} type="button">
      开始游戏
    </button>
  ),
}));

vi.mock("../../ui/screens/GameScreen", () => ({
  GameScreen: () => <div data-testid="game-screen">game</div>,
}));

vi.mock("../../ui/screens/ResultScreen", () => ({
  ResultScreen: () => null,
}));

vi.mock("../../ui/components/RulesDialog", () => ({
  RulesDialog: () => null,
}));

import App from "../../App";

beforeEach(() => {
  vi.useFakeTimers();
  createMatchMock.mockReset();
  dispatchAiTurnMock.mockReset();
  dispatchHumanActionMock.mockReset();
  mockPlaySound.mockReset();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

it("does not replay ai action sounds while an opponent borrow is waiting for player input", () => {
  const aiTurnMatch = {
    snapshot: {
      status: "playing",
      turn: "opponent",
      phase: "playing",
      difficulty: "normal",
    },
  };
  const waitingForBorrowSelection = {
    snapshot: {
      status: "playing",
      turn: "opponent",
      phase: "borrowing",
      borrowRequester: "opponent",
      difficulty: "normal",
    },
  };

  createMatchMock.mockReturnValue(aiTurnMatch);
  dispatchAiTurnMock.mockReturnValue(waitingForBorrowSelection);

  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "开始游戏" }));
  mockPlaySound.mockClear();

  act(() => {
    vi.advanceTimersByTime(420);
  });

  expect(dispatchAiTurnMock).toHaveBeenCalledTimes(1);
  expect(mockPlaySound).toHaveBeenCalledTimes(1);

  act(() => {
    vi.advanceTimersByTime(420);
  });

  expect(dispatchAiTurnMock).toHaveBeenCalledTimes(1);
  expect(mockPlaySound).toHaveBeenCalledTimes(1);
  expect(mockPlaySound).toHaveBeenCalledWith("play");
});
