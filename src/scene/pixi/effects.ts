export const cyberColors = {
  panel: 0x071321,
  neon: 0x4afff2,
  secondary: 0x6d6eff,
  accent: 0x13f1fc,
  text: 0xe9fdff,
  muted: 0x85dce2,
  card: 0xf4fbff,
  cardInk: 0x08131f,
  cardBack: 0x0d2239,
};

export function getGlowAlpha(active: boolean) {
  return active ? 0.9 : 0.24;
}
