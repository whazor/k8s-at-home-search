import { test, expect } from '@playwright/test';

test('test wordcloud', async ({ page }) => {
  await page.goto('.');

  await page.waitForSelector('"cert-manager"');

  // there should only be one link with the text "cert-manager",
  // so any errors suggesting that there are multiple links with
  // the same text suggests there is a bug in the wordcloud
  await page.getByRole('link', { name: 'cert-manager' }).click();
  await expect(page).toHaveURL('/hr/charts.jetstack.io-cert-manager');

  const rows = page.locator('table tbody tr');
  for (let i = 0; i < 5; i++) {
    await expect(rows).not.toHaveCount(i);
  }

});

