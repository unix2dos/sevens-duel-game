import { describe, expect, it } from "vitest";

import { buildCardFaceSvg } from "../cardSvg";

describe("buildCardFaceSvg", () => {
  it("renders elegant corner indices on standard faces with generous whitespace", () => {
    const svg = buildCardFaceSvg({ id: "spades-10", rank: 10, suit: "spades" });

    // New metrics: insetX = 42, insetY = 52
    expect(svg).toContain('translate(42 52)');
    // 300 - 42 = 258, 420 - 52 = 368
    expect(svg).toContain('translate(258 368) rotate(180)');
    // Font sizes are now smaller for the elegant look
    expect(svg.match(/font-size="36"/g)).toHaveLength(2);
    expect(svg.match(/font-size="28"/g)).toHaveLength(2);
  });

  it("renders a suit-emblem center card face with one large symbol and no rank corners", () => {
    const svg = buildCardFaceSvg(
      { id: "spades-7", rank: 7, suit: "spades" },
      { faceVariant: "suit-emblem" },
    );

    expect(svg).toContain("♠");
    expect(svg.match(/♠/g)).toHaveLength(1);
    expect(svg).not.toContain(">7</text>");
    expect(svg).not.toContain("translate(28 38)");
  });
});
