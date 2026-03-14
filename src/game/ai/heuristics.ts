import { getLegalCards } from "../core/rules";
import type { Card } from "../core/types";
import type { Observation } from "./types";

function rankWeight(card: Card) {
  if (card.rank === 7) {
    return 100;
  }

  if (card.rank === 6 || card.rank === 8) {
    return 75;
  }

  if (card.rank === 5 || card.rank === 9) {
    return 55;
  }

  return 35;
}

function pseudoRandom(seed: number, salt: string) {
  let hash = seed >>> 0;

  for (const char of salt) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }

  return hash / 0x100000000;
}

function futureOptionCount(observation: Observation, candidate: Card) {
  const nextLayout = [...observation.layout, candidate];
  const nextHand = observation.hand.filter((card) => card.id !== candidate.id);

  return getLegalCards(nextLayout, nextHand).length;
}

export function scoreChildMove(_observation: Observation, card: Card, seed: number) {
  return rankWeight(card) + pseudoRandom(seed, card.id) * 20;
}

export function scoreNormalMove(observation: Observation, card: Card, seed: number) {
  return rankWeight(card) + futureOptionCount(observation, card) * 16 + pseudoRandom(seed, card.id) * 4;
}

export function scoreChallengeMove(observation: Observation, card: Card, seed: number) {
  return rankWeight(card) + futureOptionCount(observation, card) * 24 - observation.opponentHandCount * 0.2 + pseudoRandom(seed, card.id);
}
