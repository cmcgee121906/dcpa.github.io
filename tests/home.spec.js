const { test, expect } = require('@playwright/test');
const path = require('path');
const rootDir = path.join(__dirname, '..');

test('homepage loads', async ({ page }) => {
  const filePath = `file://${path.join(rootDir, 'index.html')}`;
  await page.goto(filePath);
  await expect(page.locator('body')).toBeVisible();
});
