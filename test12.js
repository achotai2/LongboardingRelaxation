const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Without trailing slash!
  await page.goto('http://localhost:5173/LongboardingRelaxation');

  console.log('Clicking button...');
  await page.click('#start-button');

  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    if (window.__VIDEO) {
        console.log('Video src:', window.__VIDEO.src);
    }
  });

  await browser.close();
})();
