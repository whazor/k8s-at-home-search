import { test, expect } from "@playwright/test";

test('test top', async ({ page }) => {
  await page.goto('.');
  // Click [placeholder="search a chart"]
  await page.locator('[placeholder="search a chart"]').click();
  // Fill [placeholder="search a chart"]
  await page.locator('[placeholder="search a chart"]').fill('top');
  await expect(page).toHaveURL('.#/top');
  // Click text=83 >> nth=0

  const rows = page.locator('table tbody tr');
  for (let i = 0; i < 40; i++) {
    await expect(rows).not.toHaveCount(i);
  }

});
