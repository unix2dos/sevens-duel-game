import { render, screen } from "@testing-library/react";

import App from "../App";

it("renders the start game call-to-action", () => {
  render(<App />);

  expect(screen.getByRole("button", { name: /开始游戏/i })).toBeInTheDocument();
});
