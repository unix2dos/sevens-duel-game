export type SoundName = "deal" | "play" | "borrow" | "result" | "ui";

export interface SoundDefinition {
  src?: string[];
  volume: number;
}

export const soundDefinitions: Record<SoundName, SoundDefinition> = {
  deal: { src: ["/assets/audio/game-start.mp3"], volume: 0.34 },
  play: { src: ["/assets/audio/card-play.mp3"], volume: 0.42 },
  borrow: { src: ["/assets/audio/card-borrow.mp3"], volume: 0.46 },
  result: { src: ["/assets/audio/round-end.mp3"], volume: 0.5 },
  ui: { src: ["/assets/audio/ui-click.mp3"], volume: 0.24 },
};
