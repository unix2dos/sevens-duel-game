import { describe, expect, it } from "vitest";

import playwrightConfig from "../../../playwright.config";

describe("playwright.config", () => {
  it("starts a local web server for smoke tests", () => {
    expect(playwrightConfig.webServer).toMatchObject({
      command: expect.stringContaining("npm run dev"),
      reuseExistingServer: true,
      url: "http://127.0.0.1:4173",
    });
  });
});
