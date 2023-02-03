import { test, expect } from '@playwright/test';

test('test helm release page', async ({ page }) => {
    await page.goto('/k8s-at-home-search/hr/charts.jetstack.io-cert-manager');
    await expect(page.$$('text="is a certificate management controller for Kubernetes."')).toBeTruthy();

    // Top Repositories (5 out of N), find out N
    const topRepositories = await page.$$('h3:has-text("Top Repositories")');
    await expect(topRepositories.length).toBe(1);
    const topRepositoriesText = await topRepositories[0].innerText();
    // use regex
    const regex = /Top\s*Repositories \(5 out of (\d+)\)/;
    const matches = topRepositoriesText.match(regex);
    const topRepositoriesCount = parseInt(matches![1]);
    await expect(topRepositoriesCount).toBeGreaterThan(80);

    // installCRDs (98)
    const installCRDs = await page.$$('a:has-text("installCRDs")');
    await expect(installCRDs.length).toBe(1);
    const installCRDsText = await installCRDs[0].innerText();
    // use regex
    const regex2 = /installCRDs \((\d+)\)/;
    const matches2 = installCRDsText.match(regex2);
    const installCRDsCount = parseInt(matches2![1]);
    await expect(installCRDsCount).toBeGreaterThan(50);
});
