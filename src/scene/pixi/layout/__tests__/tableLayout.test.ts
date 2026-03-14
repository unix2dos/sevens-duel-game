import { describe, expect, it } from "vitest";

import { createTableLayout } from "../tableLayout";

describe("createTableLayout", () => {
  it("reserves a compact top safe area so the board stays uncluttered", () => {
    const layout = createTableLayout(390, 844);

    expect(layout.compact).toBe(true);
    expect(layout.topBar.width).toBeLessThan(layout.board.width);
    expect(layout.toastAnchor.y).toBeLessThan(layout.board.y + 8);
    expect(layout.suitLanes).toHaveLength(4);
  });
});
