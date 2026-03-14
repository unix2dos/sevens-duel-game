import { chooseChallengeMove } from "../ai/challenge";
import { chooseChildMove } from "../ai/child";
import { chooseNormalMove } from "../ai/normal";
import type { Observation } from "../ai/types";
import { buildDeck, dealHands } from "../core/deck";
import { applyBorrowWhenStuck, applyPlayCard, createInitialGameState, getCurrentHand } from "../core/reducer";
import { getLegalCards } from "../core/rules";
import type { GameEvent } from "../core/events";
import type { Actor, GameState } from "../core/state";
import type { Card } from "../core/types";

export type Difficulty = "child" | "normal" | "challenge";

export interface MatchSnapshot extends GameState {
  difficulty: Difficulty;
}

export interface Match {
  snapshot: MatchSnapshot;
}

export type HumanAction =
  | { type: "play"; cardId: string }
  | { type: "borrow" };

interface CreateMatchOptions {
  seed: number;
  difficulty: Difficulty;
  initialHands?: {
    player: string[];
    opponent: string[];
  };
}

function toCardIds(cards: Card[]) {
  return cards.map((card) => card.id);
}

function chooseMove(snapshot: MatchSnapshot, observation: Observation) {
  switch (snapshot.difficulty) {
    case "child":
      return chooseChildMove(observation, snapshot.rngState);
    case "normal":
      return chooseNormalMove(observation, snapshot.rngState);
    case "challenge":
      return chooseChallengeMove(observation, snapshot.rngState);
  }
}

function createSnapshot(options: CreateMatchOptions): MatchSnapshot {
  const baseState = options.initialHands
    ? createInitialGameState({
        playerCards: options.initialHands.player,
        opponentCards: options.initialHands.opponent,
        seed: options.seed,
      })
    : (() => {
        const dealt = dealHands(buildDeck(), options.seed);

        return createInitialGameState({
          playerCards: toCardIds(dealt.player),
          opponentCards: toCardIds(dealt.opponent),
          seed: options.seed,
        });
      })();

  return {
    ...baseState,
    difficulty: options.difficulty,
  };
}

function applyEvent(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case "GAME_STARTED":
      return state;
    case "CARD_BORROWED": {
      const actorHand =
        event.actor === "player" ? state.hands.player : state.hands.opponent;
      const targetHand =
        event.target === "player" ? state.hands.player : state.hands.opponent;
      const borrowedCard = targetHand.find((card) => card.id === event.cardId);

      if (!borrowedCard) {
        return state;
      }

      return {
        ...state,
        hands:
          event.actor === "player"
            ? {
                player: [...actorHand, borrowedCard],
                opponent: targetHand.filter((card) => card.id !== event.cardId),
              }
            : {
                player: targetHand.filter((card) => card.id !== event.cardId),
                opponent: [...actorHand, borrowedCard],
              },
        eventLog: [...state.eventLog, event],
      };
    }
    case "CARD_PLAYED": {
      const hand =
        event.actor === "player" ? state.hands.player : state.hands.opponent;
      const card = hand.find((entry) => entry.id === event.cardId);

      if (!card) {
        return state;
      }

      return {
        ...state,
        hands:
          event.actor === "player"
            ? {
                ...state.hands,
                player: hand.filter((entry) => entry.id !== event.cardId),
              }
            : {
                ...state.hands,
                opponent: hand.filter((entry) => entry.id !== event.cardId),
              },
        layout: [...state.layout, card],
        phase: "playing",
        eventLog: [...state.eventLog, event],
      };
    }
    case "TURN_PASSED":
      return {
        ...state,
        turn: event.actor,
        eventLog: [...state.eventLog, event],
      };
    case "GAME_FINISHED":
      return {
        ...state,
        status: "finished",
        phase: "finished",
        winner: event.winner,
        reason: event.reason,
        eventLog: [...state.eventLog, event],
      };
  }
}

function withSnapshot(match: Match, snapshot: GameState): Match {
  return {
    snapshot: {
      ...snapshot,
      difficulty: match.snapshot.difficulty,
    },
  };
}

export function createMatch(options: CreateMatchOptions): Match {
  return {
    snapshot: createSnapshot(options),
  };
}

export function dispatchHumanAction(match: Match, action: HumanAction): Match {
  if (action.type === "play") {
    const legalCardIds = new Set(getLegalCards(match.snapshot.layout, getCurrentHand(match.snapshot)).map((card) => card.id));

    if (!legalCardIds.has(action.cardId)) {
      return match;
    }
  }

  const nextState =
    action.type === "borrow"
      ? applyBorrowWhenStuck(match.snapshot)
      : applyPlayCard(match.snapshot, action.cardId);

  return withSnapshot(match, nextState);
}

export function dispatchAiTurn(match: Match): Match {
  const observation = getObservation(match.snapshot);

  if (observation.actor !== "opponent") {
    return match;
  }

  if (observation.legalCards.length === 0) {
    return withSnapshot(match, applyBorrowWhenStuck(match.snapshot));
  }

  const move = chooseMove(match.snapshot, observation);

  if (!move) {
    return match;
  }

  return withSnapshot(match, applyPlayCard(match.snapshot, move.id));
}

export function getObservation(snapshot: MatchSnapshot, actor: Actor = snapshot.turn): Observation {
  const hand = actor === "player" ? snapshot.hands.player : snapshot.hands.opponent;
  const opponentHand = actor === "player" ? snapshot.hands.opponent : snapshot.hands.player;

  return {
    actor,
    hand,
    layout: snapshot.layout,
    legalCards: getLegalCards(snapshot.layout, hand),
    opponentHandCount: opponentHand.length,
    phase: snapshot.phase,
  };
}

export function replayMatch(seed: number, eventLog: GameEvent[]): MatchSnapshot {
  const baseMatch = createMatch({ seed, difficulty: "normal" });
  const replayedState = eventLog.slice(1).reduce<GameState>(applyEvent, {
    ...baseMatch.snapshot,
    eventLog: [eventLog[0] ?? { type: "GAME_STARTED", seed }],
  });

  return {
    ...replayedState,
    difficulty: baseMatch.snapshot.difficulty,
  };
}
