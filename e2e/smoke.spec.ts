import { expect, test } from "@playwright/test";

test("user can start a game and take a valid action on desktop", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "开始游戏" }).click();

  await expect(page.getByText(/当前难度：/)).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();

  await page.waitForFunction(() => {
    const legalCard = document.querySelector(".legal-card-button");
    const borrowButton = document.querySelector(".borrow-callout .primary-action");

    return Boolean(legalCard) || Boolean(borrowButton && !(borrowButton as HTMLButtonElement).disabled);
  });

  const legalActions = page.locator(".legal-card-button");

  if (await legalActions.count()) {
    await legalActions.first().click();
    await expect(page.getByLabel("回合事件")).toContainText(/你打出了|AI 接手回合|轮到你/);
  } else {
    await page.getByRole("button", { name: "执行随机借牌" }).click();
    await expect(page.getByLabel("回合事件")).toContainText(/借走了|AI 接手回合|轮到你/);
  }

  await expect(page.locator("canvas")).toBeVisible();
});
