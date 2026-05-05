const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173/LongboardingRelaxation/');

  await page.evaluate(() => {
    try {
      console.log('window.DeviceOrientationEvent', window.DeviceOrientationEvent !== undefined);
      console.log('type requestPermission', typeof window.DeviceOrientationEvent?.requestPermission);
    } catch(e) {
      console.log('Error evaluating:', e.message);
    }
  });

  await browser.close();
})();
