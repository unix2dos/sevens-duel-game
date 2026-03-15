import { describe, expect, it } from "vitest";

import { buildCardFaceSvg } from "../cardSvg";

describe("buildCardFaceSvg", () => {
  it("renders enlarged corner indices on standard faces for faster scanning", () => {
    const svg = buildCardFaceSvg({ id: "spades-10", rank: 10, suit: "spades" });

    expect(svg).toContain('translate(36 48)');
    expect(svg).toContain('translate(264 372) rotate(180)');
    expect(svg.match(/font-size="42"/g)).toHaveLength(2);
    expect(svg.match(/font-size="34"/g)).toHaveLength(2);
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
