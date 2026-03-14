import { suitInk, suitSymbol, rankText, pipLayout } from "../cardGlyphs";

it("maps suits to standard poker symbols and ink tones", () => {
  expect(suitSymbol("hearts")).toBe("♥");
  expect(suitSymbol("spades")).toBe("♠");
  expect(suitInk("diamonds")).toBe("warm");
  expect(suitInk("clubs")).toBe("dark");
});

it("maps ranks and numeric pip layouts for real poker cards", () => {
  expect(rankText("Q")).toBe("Q");
  expect(rankText(10)).toBe("10");
  expect(pipLayout(7)).toHaveLength(7);
  expect(pipLayout("A")).toEqual([]);
});
