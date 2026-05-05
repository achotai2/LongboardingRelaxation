const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173/LongboardingRelaxation/');

  await page.evaluate(() => {
    const scene = new THREE.Scene();
    console.log('Scene created?', scene !== undefined);
  });

  console.log('Clicking button...');
  await page.click('#start-button');

  await page.waitForTimeout(2000);

  await browser.close();
})();
