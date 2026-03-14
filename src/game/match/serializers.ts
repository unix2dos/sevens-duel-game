import type { MatchSnapshot } from "./engine";

export function serializeSnapshot(snapshot: MatchSnapshot) {
  return JSON.stringify(snapshot);
}

export function deserializeSnapshot(serializedSnapshot: string): MatchSnapshot {
  return JSON.parse(serializedSnapshot) as MatchSnapshot;
}
