const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173/LongboardingRelaxation/');

  await page.evaluate(() => {
    // monkey patch play to catch rejection
    const originalPlay = HTMLVideoElement.prototype.play;
    HTMLVideoElement.prototype.play = function() {
        console.log('Video.play() called!');
        return originalPlay.apply(this, arguments).catch(e => {
            console.log('Video.play() rejected:', e.message);
            throw e;
        });
    };
  });

  console.log('Clicking button...');
  await page.click('#start-button');

  await page.waitForTimeout(2000);

  await browser.close();
})();
