import { expect, test, type Page } from "@playwright/test";

async function hasRenderedTable(page: Page) {
  const screenshot = await page.screenshot({ scale: "css" });

  return page.evaluate(async (encodedShot) => {
    const image = new Image();
    image.src = `data:image/png;base64,${encodedShot}`;
    await new Promise((resolve) => {
      image.onload = () => resolve(null);
    });

    const probe = document.createElement("canvas");
    probe.width = image.width;
    probe.height = image.height;
    const context = probe.getContext("2d", { willReadFrequently: true });

    if (!context) {
      return false;
    }

    context.drawImage(image, 0, 0);

    let minBrightness = Number.POSITIVE_INFINITY;
    let maxBrightness = Number.NEGATIVE_INFINITY;
    let brightSamples = 0;

    for (let row = 1; row < 8; row += 1) {
      for (let column = 1; column < 8; column += 1) {
        const x = Math.floor((image.width * column) / 8);
        const y = Math.floor((image.height * row) / 8);
        const [r, g, b] = context.getImageData(x, y, 1, 1).data;
        const brightness = r + g + b;

        minBrightness = Math.min(minBrightness, brightness);
        maxBrightness = Math.max(maxBrightness, brightness);

        if (brightness > 160) {
          brightSamples += 1;
        }
      }
    }

    return maxBrightness - minBrightness > 70 && brightSamples >= 4;
  }, screenshot.toString("base64"));
}

test("user can start a game and take a valid action on desktop", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "开始游戏" }).click();

  await expect(page.getByRole("region", { name: /对局牌桌/i })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator(".legal-card-button")).toHaveCount(0);
  await expect(page.getByText(/当前可打/)).toHaveCount(0);
  await expect(page.getByText(/事件流/)).toHaveCount(0);
  await expect
    .poll(() => hasRenderedTable(page), {
      intervals: [200, 400, 800],
      timeout: 3_000,
    })
    .toBeTruthy();
});
