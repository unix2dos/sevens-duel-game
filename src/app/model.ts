export type DifficultyId = "child" | "normal" | "challenge";
export type ScreenId = "home" | "game" | "result";

export const difficultyLabels: Record<DifficultyId, string> = {
  child: "儿童",
  normal: "标准",
  challenge: "挑战",
};
