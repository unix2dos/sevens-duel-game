import { canPlayCard, getLegalCards } from "../rules";
import type { Card } from "../types";

const sevenHearts: Card = { id: "hearts-7", suit: "hearts", rank: 7 };
const sixHearts: Card = { id: "hearts-6", suit: "hearts", rank: 6 };
const eightHearts: Card = { id: "hearts-8", suit: "hearts", rank: 8 };
const twoHearts: Card = { id: "hearts-2", suit: "hearts", rank: 2 };
const aceHearts: Card = { id: "hearts-A", suit: "hearts", rank: "A" };
const kingHearts: Card = { id: "hearts-K", suit: "hearts", rank: "K" };
const queenHearts: Card = { id: "hearts-Q", suit: "hearts", rank: "Q" };
const jackHearts: Card = { id: "hearts-J", suit: "hearts", rank: "J" };
const tenHearts: Card = { id: "hearts-10", suit: "hearts", rank: 10 };
const nineHearts: Card = { id: "hearts-9", suit: "hearts", rank: 9 };

it("only allows a seven before a suit is opened", () => {
  expect(canPlayCard([], sevenHearts)).toBe(true);
  expect(canPlayCard([], sixHearts)).toBe(false);
});

it("allows adjacent cards after a suit is opened", () => {
  expect(canPlayCard([sevenHearts], sixHearts)).toBe(true);
  expect(canPlayCard([sevenHearts], eightHearts)).toBe(true);
});

it("does not allow an ace directly after a king", () => {
  expect(canPlayCard([sevenHearts, eightHearts, nineHearts, tenHearts, jackHearts, queenHearts, kingHearts], aceHearts)).toBe(false);
});

it("allows an ace only after the same suit reaches two", () => {
  expect(canPlayCard([sevenHearts, sixHearts, { id: "hearts-5", suit: "hearts", rank: 5 }, { id: "hearts-4", suit: "hearts", rank: 4 }, { id: "hearts-3", suit: "hearts", rank: 3 }, twoHearts], aceHearts)).toBe(true);
});

it("returns every legal card in hand", () => {
  expect(getLegalCards([sevenHearts], [sixHearts, eightHearts])).toHaveLength(2);
});

it("does not list an ace as legal when the suit only reaches king", () => {
  expect(
    getLegalCards(
      [sevenHearts, eightHearts, nineHearts, tenHearts, jackHearts, queenHearts, kingHearts],
      [aceHearts],
    ),
  ).toEqual([]);
});
