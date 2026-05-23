const { test, expect } = require('@playwright/test');
const path = require('path');
const rootDir = path.join(__dirname, '..');

test.beforeEach(async ({ page }) => {
  const filePath = `file://${path.join(rootDir, 'index.html')}`;
  await page.goto(filePath);
});

test('header links navigate to pages', async ({ page }) => {
  // Verify a few key header links exist and navigate
  const links = ['about.html', 'admissions.html', 'academics.html'];
  for (const href of links) {
    const locator = page.locator(`a[href="${href}"]`).first();
    await expect(locator).toBeVisible();
    await locator.click();
    await expect(page.locator('body')).toBeVisible();
    await page.goBack();
  }
});
