import type { Card } from "../core/types";

export interface Observation {
  actor: "player" | "opponent";
  hand: Card[];
  layout: Card[];
  legalCards: Card[];
  opponentHandCount: number;
  phase: "opening" | "playing" | "borrowing" | "finished";
}
