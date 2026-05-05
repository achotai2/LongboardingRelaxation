const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173/LongboardingRelaxation/');

  await page.click('#start-button');

  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    console.log('typeof window.DeviceOrientationEvent', typeof window.DeviceOrientationEvent);
    console.log('typeof DeviceOrientationEvent', typeof DeviceOrientationEvent);
    console.log('window.DeviceOrientationEvent', window.DeviceOrientationEvent);
    console.log('DeviceOrientationEvent', DeviceOrientationEvent);
  });

  await browser.close();
})();
