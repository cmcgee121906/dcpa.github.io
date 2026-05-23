const { test, expect } = require('@playwright/test');
const path = require('path');
const rootDir = path.join(__dirname, '..');

test('apply buttons route to apply page', async ({ page }) => {
  const filePath = `file://${path.join(rootDir, 'index.html')}`;
  await page.goto(filePath);
  const anchors = page.locator('a:has-text("APPLY NOW")');
  const count = await anchors.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(anchors.nth(i)).toHaveAttribute('href', 'apply.html');
  }
});

test('apply page includes initial application fields and submits to Google Form', async ({ page }) => {
  const applyPath = `file://${path.join(rootDir, 'apply.html')}`;
  await page.goto(applyPath);
  const form = page.locator('form#apply-form');
  await expect(form).toBeVisible();
  await expect(form.locator('input#parent-name')).toBeVisible();
  await expect(form.locator('input#parent-email')).toBeVisible();
  await expect(form.locator('input#parent-phone')).toBeVisible();
  await expect(form.locator('input#student-name')).toBeVisible();
  await expect(form.locator('button[type="submit"]')).toBeVisible();
  await expect(form).toHaveAttribute('action', /docs.google.com\/forms\/d\/e\//);
});
