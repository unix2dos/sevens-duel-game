import { describe, expect, it } from "vitest";

import { createMatch } from "../../../../game/match/engine";
import { createTableLayout } from "../../layout/tableLayout";
import { createOpponentLayer } from "../OpponentLayer";

describe("createOpponentLayer", () => {
  it("hides decorative opponent back cards and relies on the top status summary instead", () => {
    const layout = createTableLayout(1280, 860);
    const snapshot = createMatch({ difficulty: "normal", seed: 7 }).snapshot;
    const layer = createOpponentLayer({ layout, snapshot });

    expect(layer.children).toHaveLength(0);
  });
});
