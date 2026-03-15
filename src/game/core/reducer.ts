import { canPlayCard, getLegalCards } from "./rules";
import type { GameEvent } from "./events";
import type { Actor, GameResultReason, GameState, Phase } from "./state";
import type { Card, Hands, Rank, Suit } from "./types";

const rankMap: Record<string, Rank> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: "J",
  Q: "Q",
  K: "K",
  A: "A",
};

interface InitialStateConfig {
  playerCards: string[];
  opponentCards: string[];
  seed: number;
  layout?: string[];
  turn?: Actor;
  phase?: Phase;
}

function parseCard(cardId: string): Card {
  const [suit, rawRank] = cardId.split("-") as [Suit, string];

  return {
    id: cardId,
    suit,
    rank: rankMap[rawRank],
  };
}

function otherActor(actor: Actor): Actor {
  return actor === "player" ? "opponent" : "player";
}

function nextRandom(seed: number) {
  const nextSeed = (1664525 * seed + 1013904223) >>> 0;

  return {
    nextSeed,
    value: nextSeed / 0x100000000,
  };
}

function appendEvent(state: GameState, event: GameEvent): GameState {
  return {
    ...state,
    eventLog: [...state.eventLog, event],
  };
}

function replaceHands(state: GameState, hands: Hands): GameState {
  return {
    ...state,
    hands,
  };
}

function detectStarter(hands: Hands): Actor {
  return hands.player.some((card) => card.id === "hearts-3") ? "player" : "opponent";
}

function getHand(state: GameState, actor: Actor): Card[] {
  return actor === "player" ? state.hands.player : state.hands.opponent;
}

function setHand(hands: Hands, actor: Actor, nextHand: Card[]): Hands {
  return actor === "player"
    ? { ...hands, player: nextHand }
    : { ...hands, opponent: nextHand };
}

export function createInitialGameState(config: InitialStateConfig): GameState {
  const hands = {
    player: config.playerCards.map(parseCard),
    opponent: config.opponentCards.map(parseCard),
  };

  return {
    seed: config.seed,
    rngState: config.seed,
    hands,
    layout: (config.layout ?? []).map(parseCard),
    turn: config.turn ?? detectStarter(hands),
    phase: config.phase ?? "opening",
    status: "playing",
    cardOwners: {},
    eventLog: [{ type: "GAME_STARTED", seed: config.seed }],
  };
}

export function getCurrentHand(state: GameState): Card[] {
  return getHand(state, state.turn);
}

export function finishGame(state: GameState, winner: Actor, reason: GameResultReason): GameState {
  return appendEvent(
    {
      ...state,
      status: "finished",
      phase: "finished",
      winner,
      reason,
    },
    { type: "GAME_FINISHED", winner, reason },
  );
}

export function advanceTurn(state: GameState): GameState {
  if (state.status === "finished") {
    return state;
  }

  const nextTurn = otherActor(state.turn);

  return appendEvent(
    {
      ...state,
      turn: nextTurn,
    },
    { type: "TURN_PASSED", actor: nextTurn },
  );
}

export function applyPlayCard(state: GameState, cardId: string): GameState {
  if (state.status === "finished") {
    return state;
  }

  const hand = getCurrentHand(state);
  const card = hand.find((entry) => entry.id === cardId);

  if (!card || !canPlayCard(state.layout, card)) {
    throw new Error(`Illegal play attempted for ${cardId}`);
  }

  const nextHand = hand.filter((entry) => entry.id !== cardId);
  const nextLayout = [...state.layout, card];
  const withCardRemoved = replaceHands(state, setHand(state.hands, state.turn, nextHand));
  const withCardPlayed = appendEvent(
    {
      ...withCardRemoved,
      layout: nextLayout,
      cardOwners: { ...state.cardOwners, [cardId]: state.turn },
      phase: "playing",
    },
    { type: "CARD_PLAYED", actor: state.turn, cardId },
  );

  if (nextHand.length === 0) {
    return finishGame(withCardPlayed, state.turn, "played-all");
  }

  return advanceTurn(withCardPlayed);
}

export function applyBorrowWhenStuck(state: GameState): GameState {
  if (state.status === "finished") {
    return state;
  }

  const actor = state.turn;
  const target = otherActor(actor);
  const hand = getHand(state, actor);

  if (getLegalCards(state.layout, hand).length > 0) {
    return state;
  }

  if (target === "player") {
    return {
      ...state,
      phase: "borrowing",
      borrowRequester: actor,
    };
  }

  const targetHand = getHand(state, target);
  const { nextSeed, value } = nextRandom(state.rngState);
  const borrowIndex = Math.floor(value * targetHand.length);
  const borrowedCard = targetHand[borrowIndex];
  const remainingTargetHand = targetHand.filter((_, index) => index !== borrowIndex);
  const nextActorHand = [...hand, borrowedCard];
  const withBorrow = appendEvent(
    replaceHands(
      {
        ...state,
        rngState: nextSeed,
      },
      setHand(setHand(state.hands, actor, nextActorHand), target, remainingTargetHand),
    ),
    { type: "CARD_BORROWED", actor, target, cardId: borrowedCard.id },
  );

  if (remainingTargetHand.length === 0) {
    return finishGame(withBorrow, target, "borrowed-empty");
  }

  if (canPlayCard(withBorrow.layout, borrowedCard)) {
    return applyPlayCard(withBorrow, borrowedCard.id);
  }

  return advanceTurn(withBorrow);
}

export function applyGiveCard(state: GameState, cardId: string): GameState {
  if (state.phase !== "borrowing" || !state.borrowRequester) {
    return state;
  }

  const actor = state.borrowRequester;
  const target = otherActor(actor);
  const hand = getHand(state, actor);
  const targetHand = getHand(state, target);

  const borrowedCard = targetHand.find((c) => c.id === cardId);
  if (!borrowedCard) {
    throw new Error(`Invalid give card: ${cardId}`);
  }

  const remainingTargetHand = targetHand.filter((c) => c.id !== cardId);
  const nextActorHand = [...hand, borrowedCard];
  const withBorrow = appendEvent(
    replaceHands(
      {
        ...state,
        phase: "playing",
        borrowRequester: undefined,
      },
      setHand(setHand(state.hands, actor, nextActorHand), target, remainingTargetHand)
    ),
    { type: "CARD_BORROWED", actor, target, cardId }
  );

  if (remainingTargetHand.length === 0) {
    return finishGame(withBorrow, target, "borrowed-empty");
  }

  if (canPlayCard(withBorrow.layout, borrowedCard)) {
    return applyPlayCard(withBorrow, borrowedCard.id);
  }

  return advanceTurn(withBorrow);
}
