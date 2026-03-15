import type { GameEvent } from "./events";
import type { Card, Hands } from "./types";

export type Layout = Card[];

export type Actor = "player" | "opponent";
export type Phase = "opening" | "playing" | "borrowing" | "finished";
export type GameStatus = "playing" | "finished";
export type GameResultReason = "played-all" | "borrowed-empty";

export interface GameState {
  seed: number;
  rngState: number;
  hands: Hands;
  layout: Layout;
  turn: Actor;
  phase: Phase;
  status: GameStatus;
  borrowRequester?: Actor;
  winner?: Actor;
  reason?: GameResultReason;
  cardOwners: Record<string, Actor>;
  lastPlayedCard?: { cardId: string; actor: Actor };
  eventLog: GameEvent[];
}
