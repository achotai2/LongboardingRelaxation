const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/LongboardingRelaxation/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'before.png' });
  await page.click('#start-button');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'after.png' });
  await browser.close();
})();
