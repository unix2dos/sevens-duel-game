export const cyberColors = {
  panel: 0x08111d,
  panelRaised: 0x102033,
  track: 0x15304d,
  halo: 0x162d49,
  border: 0x2ef0ff,
  neon: 0x67f3ff,
  secondary: 0x6877ff,
  accent: 0xff8e5e,
  spark: 0xff7b72,
  text: 0xf2fbff,
  muted: 0x93b7c6,
  card: 0xf5f1ea,
  cardEdge: 0xe5d3ba,
  cardInk: 0x122031,
  cardBack: 0x162742,
};

export function getGlowAlpha(active: boolean) {
  return active ? 0.82 : 0.14;
}
