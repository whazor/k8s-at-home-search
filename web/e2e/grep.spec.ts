import { test, expect } from '@playwright/test';

test('test grep', async ({ page }) => {
    await page.goto('.');
    // input field should be focused
    await expect(page.locator('[placeholder="Search for a helm release..."]')).toBeFocused();

    await page.locator('[placeholder="Search for a helm release..."]').type('grep ');
    await expect(page).toHaveURL('/grep#grep%20');

    await expect(page.locator('[placeholder="Search for a grep pattern..."]')).toBeFocused();

    // search for "image.repository"
    await page.locator('[placeholder="Search for a grep pattern..."]').type('image.repository');
    
    // search image.repository
    // const expand = await page
    //     .getByRole('listitem')
    //     .filter({ has: page.getByRole('heading',  { name: 'image.repository', exact: true })})
    //     .getByRole('button')
    //     // svg with title: 'Expand'
    //     .filter({ has: page.getByRole('img',  { name: 'Expand', exact: true })})
    //     .first();
    // // check if expand is visible
    // await expect(expand).toBeVisible();
    // await expand.click();
    // // .click()

    // // verify ghcr.io/onedr0p/plex is there
    // await expect(page.locator('span:has-text("ghcr.io/onedr0p/plex")')).toBeVisible();

});