const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:4173/LongboardingRelaxation/');

  await page.evaluate(() => {
     // override DeviceOrientationEvent properties temporarily
     window.DeviceOrientationEvent = function() {};
  });

  await page.click('#start-button');
  await page.waitForTimeout(1000);

  const display = await page.evaluate(() => document.getElementById('start-button').style.display);
  console.log('Button display with overridden Event:', display);

  await browser.close();
})();
