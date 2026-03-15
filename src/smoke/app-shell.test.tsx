import { render, screen } from "@testing-library/react";

import App from "../App";

it("renders the start game call-to-action", () => {
  render(<App />);

  expect(screen.getByRole("button", { name: /开始游戏/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /音效：开|音效：关/i })).toBeInTheDocument();
  expect(screen.getByText(/单机 AI 对战/)).toBeInTheDocument();
});
