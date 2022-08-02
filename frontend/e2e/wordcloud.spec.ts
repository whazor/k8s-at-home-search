import { test, expect } from '@playwright/test';

test('test wordcloud', async ({ page }) => {
  await page.goto('.');

  await page.waitForSelector('"cert-manager"');

  const wordcloud = await page.$$('a.word-cloud-word');
  expect(wordcloud).not.toHaveLength(0)

  await page.locator('text=cert-manager').click();
  await expect(page).toHaveURL('#/cert-manager');


  const rows = page.locator('table tbody tr');
  for (let i = 0; i < 80; i++) {
    await expect(rows).not.toHaveCount(i);
  }

});

