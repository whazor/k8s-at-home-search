import { test, expect } from '@playwright/test';

test('test search', async ({ page }) => {
  await page.goto('.');


  // Click [placeholder="search a chart"]
  await page.locator('[placeholder="search a chart"]').click();
  // Fill [placeholder="search a chart"]
  await page.locator('[placeholder="search a chart"]').fill('plex');
  await expect(page).toHaveURL('#/plex');

  const lastModified = page.locator('td.last-modified');
  await expect(lastModified).toHaveText(/days ago/);

  const links = await page.$$('a:has-text("plex")');
  expect(links).not.toHaveLength(0)

  const rows = page.locator('table tbody tr');
  for (let i = 0; i < 30; i++) {
    await expect(rows).not.toHaveCount(i);
  }
});
