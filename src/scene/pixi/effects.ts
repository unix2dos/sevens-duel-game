export const cyberColors = {
  // We keep the name cyberColors to avoid breaking imports, but update the values to Casino Luxury
  panel: 0x051a0d,      // Deep shadow green
  panelRaised: 0x0a2e16, // Darker Green
  track: 0x0f3f1f,      // Casino Green
  halo: 0xd4af37,       // Gold
  border: 0xd4af37,     // Gold 
  neon: 0xffd700,       // Bright Gold
  secondary: 0xc5a059,  // Muted Gold
  accent: 0x8b0000,     // Deep Red
  spark: 0xffd700,      // Gold spark
  text: 0xfff8dc,       // Cornsilk
  muted: 0xbdb76b,      // Dark Khaki
  card: 0xfdfcfb,       // Ivory
  cardEdge: 0xd4af37,   // Gold edge
  cardInk: 0x1a1a1a,    // Near black
  cardBack: 0x0f3f1f,   // Casino Green
};

export function getGlowAlpha(active: boolean) {
  return active ? 0.82 : 0.14;
}
