const puppeteer = require('puppeteer');
const DODO_URL = 'https://app.dodoex.io/exchange/500G-500DC?network=bsc-mainnet';
// const META_MASK_CHROME_EXT = 'chrome://extensions/?id=nkbihfbeogaeaoehlefnkodbefgpgknn';
const META_MASK_VERSION = '9.8.4_0';
const META_MASK_CHROME_EXT = 'C:/Users/pangz/AppData/Local/Google/Chrome/User Data/Default/Extensions/nkbihfbeogaeaoehlefnkodbefgpgknn/'+META_MASK_VERSION;
const META_PROFILE_DIR = 'C:/Users/pangz/AppData/Local/Chromium/User Data/Profile 1';
// (async () => {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();
//   await page.goto(DODO_URL);
//   await page.screenshot({ path: 'example.png' });

//   // await browser.close();
// })();

(async () => {
  const pathToExtension = META_MASK_CHROME_EXT;
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: [
      `--start-maximized`,
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      `--user-data-dir=${META_PROFILE_DIR}`
    ],
  });
  let page = await browser.newPage();
  // browser.
  await page.goto(DODO_URL);

  // await page.evaluate(() => window.open('https://app.dodoex.io/exchange/500G-500DC?network=bsc-mainnet'));
  // const newWindowTarget = await browser.waitForTarget(
  //   (target) => target.url() === DODO_URL
  // );
  // page = await browser.pages()[1];
  // await page.click('//*[@id="entry"]/div[3]/div/div[2]/div/div/div[1]/div[1]/div/div/div/button');
  // await page.screenshot({ path: 'example.png' });
  await page.bringToFront();
  const BTN_SEL = '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > button';
  const CHKBOX_EULA = '#entry > div.Headerstyled__HeaderAnchor-dodo__nwr9t4-0.eETxzx > div > div.Headerstyled__HeaderContainer-dodo__nwr9t4-2.ghLitl > div.indexstyled__HeaderRightWrapper-dodo__vrc5bo-0.dIEubP > div > span > div > div > div.sc-crzoAE.DykGo.ps > div.sc-iqAclL.iMGqIp > div > div.sc-gKAaRy.sUDHl > div > div.sc-iklJeh.sc-jcwpoC.hbusih.kyvWZW > div.sc-bCwfaz.sc-kLojOw.hzzSzX.iehvjW > div';
  const MM_ENABLE = '#entry > div.Headerstyled__HeaderAnchor-dodo__nwr9t4-0.eETxzx > div > div.Headerstyled__HeaderContainer-dodo__nwr9t4-2.ghLitl > div.indexstyled__HeaderRightWrapper-dodo__vrc5bo-0.dIEubP > div > span > div > div > div.sc-crzoAE.DykGo.ps > div.sc-iqAclL.iMGqIp > div > div.sc-gKAaRy.sUDHl > div > div:nth-child(5) > div:nth-child(1)';
  // await page.waitForSelector(BTN_SEL , {
  //   timeout: 1000
  // })
  Promise.all([
    await page.click(BTN_SEL, {delay: 3000}),
    await page.click(CHKBOX_EULA, {delay: 3000}),
    await page.click(MM_ENABLE, {delay: 3000}),
  ])
  // const targets = await browser.targets();
  // const backgroundPageTarget = targets.find(
  //   (target) => target.type() === 'background_page'
  // );
  // const backgroundPage = await backgroundPageTarget.page();
  // Test the background page as you would any other page.
  // await browser.close();
})();