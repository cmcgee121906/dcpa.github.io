const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const filePath = `file://${path.join(__dirname, '..', 'index.html')}`;
  try {
    await page.goto(filePath);
    const bodyVisible = await page.locator('body').isVisible();
    console.log('Opened:', filePath);
    console.log('Body visible:', bodyVisible);
    await browser.close();
    process.exit(bodyVisible ? 0 : 2);
  } catch (err) {
    console.error('Error running playwright check:', err);
    await browser.close();
    process.exit(1);
  }
})();
