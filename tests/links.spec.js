const { test, expect } = require('@playwright/test');
const path = require('path');
const rootDir = path.join(__dirname, '..');

test('internal html links load', async ({ page }) => {
  const filePath = `file://${path.join(rootDir, 'index.html')}`;
  await page.goto(filePath);

  // Collect all .html hrefs from the page in a single evaluation to avoid
  // locator instability while the page navigates.
  const hrefs = await page.$$eval('a[href$=".html"]', (els) =>
    els.map((e) => e.getAttribute('href'))
  );

  for (const href of hrefs) {
    if (!href) continue;
    if (href.startsWith('#') || href.startsWith('http')) continue;
    // Resolve relative paths and navigate directly to the target file using file://
    const target = `file://${path.join(rootDir, href)}`;
    await page.goto(target);
    await expect(page.locator('body')).toBeVisible();
    // navigate back to index for next iteration
    await page.goto(filePath);
  }
});

