const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173/LongboardingRelaxation/');

  console.log('Clicking button...');
  await page.click('#start-button');

  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    // try to find video in memory since we can't get it from DOM
    // We can't easily get it without exposing it.
    // Let's modify main.js temporarily to expose video.
  });

  await browser.close();
})();
