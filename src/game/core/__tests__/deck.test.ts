import { buildDeck, dealHands, findHeartThreeOwner } from "../deck";

it("builds a 52-card deck without jokers", () => {
  const deck = buildDeck();

  expect(deck).toHaveLength(52);
  expect(new Set(deck.map((card) => `${card.suit}-${card.rank}`)).size).toBe(52);
});

it("deals two hands of 26 cards and identifies the heart-three owner", () => {
  const hands = dealHands(buildDeck(), 1234);

  expect(hands.player.length).toBe(26);
  expect(hands.opponent.length).toBe(26);
  expect(findHeartThreeOwner(hands)).toMatch(/player|opponent/);
});
