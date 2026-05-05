const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/LongboardingRelaxation/');

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Clicking button...');
  await page.click('#start-button');

  await page.waitForTimeout(1000);

  const display = await page.evaluate(() => document.getElementById('start-button').style.display);
  console.log('Button display:', display);

  await browser.close();
})();
