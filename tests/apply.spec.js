const { test, expect } = require('@playwright/test');
const path = require('path');
const rootDir = path.join(__dirname, '..');

test('apply buttons point to Google Form', async ({ page }) => {
  const filePath = `file://${path.join(rootDir, 'index.html')}`;
  await page.goto(filePath);
  const anchors = page.locator('a:has-text("APPLY NOW")');
  const count = await anchors.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(anchors.nth(i)).toHaveAttribute('href', /forms.gle\/saywXHmF9ZHvQHfj8/);
    // ensure external links open in new tab when intended
    const target = await anchors.nth(i).getAttribute('target');
    if (target) expect(target).toBe('_blank');
  }
});
