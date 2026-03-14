import type { Actor, GameResultReason } from "./state";

export type GameEvent =
  | { type: "GAME_STARTED"; seed: number }
  | { type: "CARD_PLAYED"; actor: Actor; cardId: string }
  | { type: "CARD_BORROWED"; actor: Actor; target: Actor; cardId: string }
  | { type: "TURN_PASSED"; actor: Actor }
  | { type: "GAME_FINISHED"; winner: Actor; reason: GameResultReason };
