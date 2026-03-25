const { chromium } = require('playwright');

async function check(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1200);
  const text = (await page.locator('body').innerText()).trim();
  console.log(url, 'BODY_LEN=' + text.length, 'HAS_CODEQUEST=' + text.includes('CodeQuest'), 'ERRS=' + (errs.length ? errs.join(' | ') : 'none'));
  await browser.close();
}

(async()=>{
  await check('http://localhost:5000');
  try { await check('http://localhost:5001'); } catch (e) { console.log('http://localhost:5001 ERROR=' + e.message); }
})();
