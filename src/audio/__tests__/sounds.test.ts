import { soundDefinitions } from "../sounds";

describe("soundDefinitions", () => {
  it("defines distributable sources for every showcase sound", () => {
    for (const [name, definition] of Object.entries(soundDefinitions)) {
      expect(
        definition.src?.length,
        `${name} should have at least one source`,
      ).toBeGreaterThan(0);
      expect(definition.src?.[0]).toMatch(/^\/assets\/audio\//);
      expect(definition.volume).toBeGreaterThan(0);
    }
  });
});
