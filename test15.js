const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173/LongboardingRelaxation/');

  await page.click('#start-button');

  await page.waitForTimeout(1000);

  const display = await page.evaluate(() => document.getElementById('start-button').style.display);
  console.log('Button display:', display);

  await browser.close();
})();
