import { describe, expect, it } from "vitest";

import { buildCardFaceSvg } from "../cardSvg";

describe("buildCardFaceSvg", () => {
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
