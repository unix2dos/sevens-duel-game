import { expect, test } from "@playwright/test";

test("user can start a game and see the table on desktop", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "开始游戏" }).click();

  await expect(page.getByText(/当前难度：/)).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
});
