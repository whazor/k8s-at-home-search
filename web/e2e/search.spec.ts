import { test, expect } from '@playwright/test';

test('test search', async ({ page }) => {
  await page.goto('.');


  // Click [placeholder="search a chart"]
  await page.locator('[placeholder="Search for a helm release..."]').click();
  // Fill [placeholder="search a chart"]
  await page.locator('[placeholder="Search for a helm release..."]').fill('plex');
  // await expect(page).toHaveURL('#/plex');


  // code to check if the search results are correct
  // <td><a href="/hr/bjw-s.github.io-helm-charts-app-template-plex">plex</a></td><td><a href="/hr/bjw-s.github.io-helm-charts-app-template-plex">bjw-s/app-template</a></td><td><a href="/hr/bjw-s.github.io-helm-charts-app-template-plex">35</a></td>
  // check if table has plex, parse count value and check if it is above 15
  // first select row with plex
  const rows = await page.locator('table tbody tr:has(a:has-text("plex"))').all();
  // at least one row should be found
  await expect(rows.length).toBeGreaterThan(0);
  // get the count value
  const count = await rows[0].locator('td:nth-of-type(3)').innerText();
  // check if count is above or equal to 5
  await expect(parseInt(count)).toBeGreaterThan(4);

  // click on first cell of first row
  await rows[0].locator('td:nth-of-type(1) a').click();

  // check url, it must be either of the two (OCI vs non-OCI)
  await expect(page).toHaveURL('/hr/ghcr.io-bjw-s-labs-helm-app-template-plex');
});
