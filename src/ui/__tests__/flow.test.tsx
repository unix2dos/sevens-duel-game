import { fireEvent, render, screen } from "@testing-library/react";

import App from "../../App";

it("starts a game after selecting a difficulty", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("radio", { name: /儿童/i }));
  fireEvent.click(screen.getByRole("button", { name: /开始游戏/i }));

  expect(screen.getByText(/当前难度：儿童/i)).toBeInTheDocument();
});
