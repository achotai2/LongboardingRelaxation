const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173/LongboardingRelaxation/');

  await page.evaluate(() => {
    console.log('typeof DeviceOrientationEvent:', typeof DeviceOrientationEvent);
    console.log('typeof DeviceOrientationEvent.requestPermission:', typeof DeviceOrientationEvent?.requestPermission);
  });

  await browser.close();
})();
