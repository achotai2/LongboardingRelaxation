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
    if (window.__VIDEO) {
        console.log('Video src:', window.__VIDEO.src);
        console.log('Video error:', window.__VIDEO.error);
        console.log('Video networkState:', window.__VIDEO.networkState);
        console.log('Video readyState:', window.__VIDEO.readyState);
        console.log('Video is paused?', window.__VIDEO.paused);
    } else {
        console.log('Video not found');
    }
  });

  await browser.close();
})();
