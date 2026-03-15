import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";

const { mockPlaySound } = vi.hoisted(() => ({
  mockPlaySound: vi.fn(),
}));

vi.mock("../../audio/useSound", () => ({
  useSound: () => ({
    playSound: mockPlaySound,
  }),
}));

import App from "../../App";

afterEach(() => {
  mockPlaySound.mockClear();
});

function fillPlayerName(name: string) {
  fireEvent.change(screen.getByRole("textbox", { name: /玩家姓名/i }), {
    target: { value: name },
  });
}

it("requires a non-empty player name before starting a game", () => {
  render(<App />);

  expect(screen.getByRole("textbox", { name: /玩家姓名/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /开始游戏/i })).toBeDisabled();

  fillPlayerName("   ");

  expect(screen.getByRole("button", { name: /开始游戏/i })).toBeDisabled();
  expect(screen.queryByTestId("table-stage")).not.toBeInTheDocument();
});

it("starts a game after selecting a difficulty and entering a player name", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("radio", { name: /儿童/i }));
  fillPlayerName("张三");
  fireEvent.click(screen.getByRole("button", { name: /开始游戏/i }));

  expect(screen.getByRole("region", { name: /对局牌桌，儿童/i })).toBeInTheDocument();
});

it("renders the gameplay screen as a canvas-first table without the old console panels", () => {
  render(<App />);

  fillPlayerName("张三");
  fireEvent.click(screen.getByRole("button", { name: /开始游戏/i }));

  expect(screen.getByTestId("table-stage")).toBeInTheDocument();
  expect(screen.queryByText(/当前可打/i)).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: /玩家控制台/i })).not.toBeInTheDocument();
});

it("keeps the player name after returning to the home screen", () => {
  render(<App />);

  fillPlayerName("张三");
  fireEvent.click(screen.getByRole("button", { name: /开始游戏/i }));
  fireEvent.click(screen.getByRole("button", { name: /^返回$/i }));

  expect(screen.getByRole("textbox", { name: /玩家姓名/i })).toHaveValue("张三");
});

it("uses showcase sound mappings for start and toggle actions", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: /音效：开/i }));
  expect(mockPlaySound).toHaveBeenCalledWith("ui");

  mockPlaySound.mockClear();

  fillPlayerName("张三");
  fireEvent.click(screen.getByRole("button", { name: /开始游戏/i }));
  expect(mockPlaySound).toHaveBeenCalledWith("deal");
});
