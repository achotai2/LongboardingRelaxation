const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173/LongboardingRelaxation/');

  console.log('Clicking button...');
  await page.click('#start-button');

  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    const video = document.querySelector('video');
    if (video) {
        console.log('Video error:', video.error);
        console.log('Video src:', video.src);
        console.log('Video networkState:', video.networkState);
        console.log('Video readyState:', video.readyState);
    } else {
        console.log('Video element not found in DOM');
    }
  });

  await browser.close();
})();
