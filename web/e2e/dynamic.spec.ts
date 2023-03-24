import { test, expect } from '@playwright/test';

test('test dynamic page', async ({ page }) => {
  await page.goto('.');


  // Click [placeholder="search a chart"]
  await page.locator('[placeholder="Search for a chart..."]').click();
  // Fill [placeholder="search a chart"]
  await page.locator('[placeholder="Search for a chart..."]').fill('istio');
  // await expect(page).toHaveURL('#/istio');


  // code to check if the search results are correct
  // <td><a href="/k8s-at-home-search/hr/bjw-s.github.io-helm-charts-app-template-plex">plex</a></td><td><a href="/k8s-at-home-search/hr/bjw-s.github.io-helm-charts-app-template-plex">bjw-s/app-template</a></td><td><a href="/k8s-at-home-search/hr/bjw-s.github.io-helm-charts-app-template-plex">35</a></td>
  // check if table has plex, parse count value and check if it is above 15
  // first select row with plex
  const rows = await page.locator('table tbody tr:has(a:has-text("istio"))').all();
  // at least one row should be found
  await expect(rows.length).toBeGreaterThan(0);
  // get the count value
  const lastRow = rows[rows.length - 1];
  const count = await lastRow.locator('td:nth-of-type(3)').innerText();
  // count < 3
  await expect(parseInt(count)).toBeLessThanOrEqual(3);
  
  const name = await lastRow.locator('td:nth-of-type(1) a').innerText();

  await expect(name).toContain('istio');

  // click on first cell of first row
  await lastRow.locator('td:nth-of-type(1) a').click();

  // check url, /.*${name}/
  await expect(page).toHaveURL(new RegExp(`.*${name}(#hr)?$`));

  await expect(page.getByText(/All\s*Repositories/)).toBeVisible()

});
