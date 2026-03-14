export type SoundName = "deal" | "play" | "borrow" | "result" | "ui";

export interface SoundDefinition {
  src?: string[];
  volume: number;
}

export const soundDefinitions: Record<SoundName, SoundDefinition> = {
  deal: { volume: 0.32 },
  play: { volume: 0.42 },
  borrow: { volume: 0.45 },
  result: { volume: 0.5 },
  ui: { volume: 0.28 },
};
