const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.evaluate(() => {
    try {
      const isUndefined = window.DeviceOrientationEvent === undefined;
      console.log('isUndefined:', isUndefined);
      if (isUndefined) {
          // This will throw if executed
          const type = typeof window.DeviceOrientationEvent.requestPermission;
          console.log(type);
      } else {
          console.log('Not undefined');
      }
    } catch(e) {
      console.log('Error:', e.message);
    }
  });

  await browser.close();
})();
