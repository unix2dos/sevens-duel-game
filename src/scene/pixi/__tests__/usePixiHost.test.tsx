import { describe, expect, it } from "vitest";

import { createPixiInitOptions } from "../pixiOptions";

describe("createPixiInitOptions", () => {
  it("builds high-density canvas options for crisp rendering", () => {
    const host = document.createElement("div");
    const options = createPixiInitOptions(host);

    expect(options).toMatchObject({
      autoDensity: true,
      resizeTo: host,
      roundPixels: true,
      resolution: window.devicePixelRatio,
    });
  });
});
