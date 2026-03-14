import { canPlayCard, getLegalCards } from "../rules";
import type { Card } from "../types";

const sevenHearts: Card = { id: "hearts-7", suit: "hearts", rank: 7 };
const sixHearts: Card = { id: "hearts-6", suit: "hearts", rank: 6 };
const eightHearts: Card = { id: "hearts-8", suit: "hearts", rank: 8 };

it("only allows a seven before a suit is opened", () => {
  expect(canPlayCard([], sevenHearts)).toBe(true);
  expect(canPlayCard([], sixHearts)).toBe(false);
});

it("allows adjacent cards after a suit is opened", () => {
  expect(canPlayCard([sevenHearts], sixHearts)).toBe(true);
  expect(canPlayCard([sevenHearts], eightHearts)).toBe(true);
});

it("returns every legal card in hand", () => {
  expect(getLegalCards([sevenHearts], [sixHearts, eightHearts])).toHaveLength(2);
});
