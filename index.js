const puppeteer = require('puppeteer-core');

const EMAIL = 'fahad.bhatti@ontariotechu.net';
const PASSWORD = 'Pop123';
const PROMPT = "make layer webite".trim();

(async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=2SWbUCvJRTdbIXWa97432edc089228df05750a2fb5fd71fbd`
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(120000);

  // 1. Login
  await page.goto('https://lovable.dev/login', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('input[type="email"]', { visible: true });
  await page.type('input[type="email"]', EMAIL);
  await page.type('input[type="password"]', PASSWORD);

  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const txt = await page.evaluate(el => el.innerText.trim(), btn);
    if (/^log in$/i.test(txt)) {
      await btn.click();
      break;
    }
  }

  // 2. Wait for chat prompt
  await page.waitForSelector('textarea#chatinput', { visible: true });

  // 3. Type and submit prompt
  await page.type('textarea#chatinput', PROMPT);
  await page.keyboard.press('Enter');

  // 4. Wait until the new project page loads
  await page.waitForFunction(() => window.location.pathname.startsWith('/projects/'), { timeout: 0 });

  // 5. Log the preview URL when available
  let previewUrl = null;
  while (!previewUrl) {
    previewUrl = await page.$$eval('a', els =>
      (els.map(el => el.href).filter(href => href && href.includes('preview-')))[0] || null
    );
    if (previewUrl) {
      console.log('✅ Preview URL:', previewUrl);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Optionally: Keep browser open for inspection
  // await browser.close(); ← add this if you want it to finish

})();
