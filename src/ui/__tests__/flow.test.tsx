import { fireEvent, render, screen } from "@testing-library/react";

import App from "../../App";

it("starts a game after selecting a difficulty", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("radio", { name: /儿童/i }));
  fireEvent.click(screen.getByRole("button", { name: /开始游戏/i }));

  expect(screen.getByRole("region", { name: /对局牌桌，儿童/i })).toBeInTheDocument();
});

it("renders the gameplay screen as a canvas-first table without the old console panels", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: /开始游戏/i }));

  expect(screen.getByTestId("table-stage")).toBeInTheDocument();
  expect(screen.queryByText(/当前可打/i)).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: /玩家控制台/i })).not.toBeInTheDocument();
});
