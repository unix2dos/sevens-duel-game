import { resolveAssetUrl } from "../app/assetUrl";

export type SoundName = "deal" | "play" | "borrow" | "result" | "ui";

export interface SoundDefinition {
  src?: string[];
  volume: number;
}

export const soundDefinitions: Record<SoundName, SoundDefinition> = {
  deal: { src: [resolveAssetUrl("assets/audio/game-start.mp3")], volume: 0.34 },
  play: { src: [resolveAssetUrl("assets/audio/card-play.mp3")], volume: 0.42 },
  borrow: { src: [resolveAssetUrl("assets/audio/card-borrow.mp3")], volume: 0.46 },
  result: { src: [resolveAssetUrl("assets/audio/round-end.mp3")], volume: 0.5 },
  ui: { src: [resolveAssetUrl("assets/audio/ui-click.mp3")], volume: 0.24 },
};
