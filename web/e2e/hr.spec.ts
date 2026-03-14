import { test, expect } from '@playwright/test';

test('test helm release page', async ({ page }) => {
  // Navigate to the most popular cert-manager release via search
  await page.goto('.');
  await page.locator('[placeholder="Search for a helm release..."]').fill('cert-manager');

  const rows = await page.locator('table tbody tr:has(a:has-text("cert-manager"))').all();
  await expect(rows.length).toBeGreaterThan(0);
  await rows[0].locator('td:nth-of-type(1) a').click();

  await expect(page).toHaveURL(/\/hr\/.*cert-manager/);
  await expect(page.$$('text="is a certificate management controller for Kubernetes."')).toBeTruthy();

  // Repositories heading can say "Top", "All", or "Filtered" depending on data size
  const repoHeadings = await page.$$('h4');
  await expect(repoHeadings.length).toBeGreaterThan(0);
  const repoHeadingText = await repoHeadings[0].innerText();
  const regex = /(?:Top|All|Filtered)\s*Repositories \((\d+) out of (\d+)\)/;
  const matches = repoHeadingText.match(regex);
  const totalCount = parseInt(matches![2]);
  await expect(totalCount).toBeGreaterThan(40);

  // installCRDs should appear as a popular value
  const installCRDs = await page.$$('a:has-text("installCRDs")');
  await expect(installCRDs.length).toBe(1);
  const installCRDsText = await installCRDs[0].innerText();
  const regex2 = /installCRDs \((\d+)\)/;
  const matches2 = installCRDsText.match(regex2);
  const installCRDsCount = parseInt(matches2![1]);
  await expect(installCRDsCount).toBeGreaterThan(20);
});
