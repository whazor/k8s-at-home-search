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

  // CRD installation should appear as a popular value.
  // cert-manager v1.15+ renamed installCRDs to crds.enabled, so the most
  // popular release may use either key depending on which source is dominant.
  const installCRDsLinks = await page.$$('a:has-text("installCRDs")');
  const crdsEnabledLinks = await page.$$('a:has-text("crds.enabled")');
  const crdLink = installCRDsLinks.length > 0 ? installCRDsLinks[0] : crdsEnabledLinks[0];
  await expect(crdLink).toBeTruthy();
  const crdText = await crdLink.innerText();
  const crdRegex = /(?:installCRDs|crds\.enabled) \((\d+)\)/;
  const crdMatches = crdText.match(crdRegex);
  const crdCount = parseInt(crdMatches![1]);
  await expect(crdCount).toBeGreaterThan(10);
});
