const puppeteer = require('puppeteer');
const DODO_URL = 'https://app.dodoex.io/exchange/500G-500DC?network=bsc-mainnet';


const DODO_FROM_TOKEN_TEXT = '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(3) > div > div > div.TokenDisp__Name-dodo__onyo6i-1.gfuMgU';

const DODO_FROM_TOKEN = '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(3) > input';

const DODO_TO_TOKEN_TEXT = '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(6) > div > div > div.TokenDisp__Name-dodo__onyo6i-1.gfuMgU';

const DODO_TO_TOKEN = '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(6) > input';



const DODO_PRE_SWAP = '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > button';

const DODO_PRE_SWAP_XPATH = '//*[@id="entry"]/div[3]/div/div[2]/div/div/div[1]/div[1]/div/div/div/button';
const DODOD_CONFIRM_SWAP= '#app-content > div > div.main-container-wrapper > div > div.confirm-page-container-content > div.page-container__footer > footer > button.button.btn-primary.page-container__footer-button';
const DODOD_CONFIRM_SWAP_XPATH = '//*[@id="app-content"]/div/div[3]/div/div[3]/div[3]/footer/button[2]';

const DODO_PRICE_DEVIATION_VALUE = '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(12) > div.MainSectionWidgets__SummaryRight-dodo__sc-4vscbh-2.hjnCVP';

const DODO_AFTER_SWAP_BUTTON = '#entry > div.Dialog__DialogBackdrop-dodo__olf3aw-0.ccRRLn.dialog-backdrop.fade-enter-done > div > div.Dialog__DialogBody-dodo__olf3aw-6.bLVQPQ.dialog-body > button';




// const META_MASK_CHROME_EXT = 'chrome://extensions/?id=nkbihfbeogaeaoehlefnkodbefgpgknn';
const META_MASK_VERSION = '9.8.4_0';
const META_MASK_CHROME_EXT = 'C:/Users/pangz/AppData/Local/Google/Chrome/User Data/Default/Extensions/nkbihfbeogaeaoehlefnkodbefgpgknn/'+META_MASK_VERSION;
const META_MASK_FIREFOX_EXT = 'C:/Users/pangz/AppData/Local/Google/Chrome/User Data/Default/Extensions/nkbihfbeogaeaoehlefnkodbefgpgknn/'+META_MASK_VERSION;
const META_PROFILE_DIR = 'C:/Users/pangz/AppData/Local/Chromium/User Data/Profile 1';
const META_MASK_PWD = '#password';
const META_MASK_LOGIN_BTN = '#app-content > div > div.main-container-wrapper > div > div > button > span';
const META_MASK_EXTENSION = 'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#unlock';


(async () => {
  const pathToExtension = META_MASK_CHROME_EXT;
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    // executablePath: 'C:/Program Files/Mozilla Firefox/firefox.exe',
    args: [
      `--start-maximized`,
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      //Needed by extension to save the data
      `--user-data-dir=${META_PROFILE_DIR}`
    ],
  });
  

  const metaMaskTab = await findTabWithUrl(browser, META_MASK_EXTENSION);
  const page = await metaMaskTab.page();
  await page.bringToFront();

  // const btnRef = await page.$(META_MASK_LOGIN_BTN);
  // console.log(await btnRef.getProperty('innerHTML'));
  await login(page);
  const loginSuccessful = await confirmLogin();
  if(!loginSuccessful) {await browser.close();}

  await page.close();
  const dodoPage = await browser.newPage();
  await dodoPage.goto(DODO_URL);
  await dodoPage.bringToFront();

  // await dodoPage.on('domcontentloaded', async () => {
  //   console.log('Document loaded');
  //   await swapToken(dodoPage);
  // });
  // await page.waitForNavigation({
  //   waitUntil: 'load',
  // });
  const isCorrectPairSet = await checkTokenPair(dodoPage);
  if(isCorrectPairSet) {
    console.log("Correct pair set");
    await prepareSwap(browser, dodoPage);
  } else {
    console.log("Correct pair not set");
  }
 
  //When page opens new tab or window
  // const [popup] = await Promise.all([
  //   new Promise(resolve => page.once('popup', resolve)),
  //   page.click('a[target=_blank]'),
  // ]);
  
})();

async function login(page) {
  const PWD = 'M@skuM3t@';
  await page.type(META_MASK_PWD, PWD, {delay: 100});
  await page.click(META_MASK_LOGIN_BTN , {delay: 3000});
}

async function confirmLogin(page) {
  return true;
}

async function findTabWithUrl(browser, tabUrl) {
  const browserContext = browser.defaultBrowserContext();
  return await browserContext.waitForTarget(target => target.url() === tabUrl);
}

async function getElementProperty(page, selector, elementCallback) {
  let selectorReference = await page.$(selector);
  return await page.evaluate(elementCallback, selectorReference);
}

async function checkTokenPair(page) {
  const tokenSource = "500G";
  const tokenDestination = "500DC";

  await page.waitForSelector(DODO_FROM_TOKEN_TEXT);
  await page.waitForSelector(DODO_TO_TOKEN_TEXT);

  // let currentTokenSource = await page.$(DODO_FROM_TOKEN_TEXT);
  // let sourceTokenText = await page.evaluate(el => el.innerHTML, currentTokenSource);
  let sourceTokenText = await getElementProperty(page, DODO_FROM_TOKEN_TEXT, el => el.innerHTML);

  // let currentTokenDestination = await page.$(DODO_TO_TOKEN_TEXT);
  // let destinationTokenText = await page.evaluate(el => el.innerHTML, currentTokenDestination);
  let destinationTokenText = await getElementProperty(page, DODO_TO_TOKEN_TEXT, el => el.innerHTML);

  return (
    sourceTokenText == tokenSource &&
    destinationTokenText == tokenDestination
  );
}

async function prepareSwap(browser, page) {
  const tokenInputValue = '1';
  console.log('Swapping token');

  // await page.waitForSelector(DODO_FROM_TOKEN);
  await page.type(DODO_FROM_TOKEN, tokenInputValue, {delay: 100});
  // await page.waitForXPath(DODO_PRE_SWAP_XPATH);
  await page.waitForSelector(DODO_PRE_SWAP);
  // console.log('XPath Found');

  let btn = await page.$(DODO_PRE_SWAP);

  let confirmButtonInterval = setInterval(async () => {
    btn = await page.$(DODO_PRE_SWAP);
    let isDisabled = await page.evaluate(el => el.disabled, btn);
    console.log(isDisabled);

    if (!isDisabled) {
      console.log('button enabled changed');
      clearInterval(confirmButtonInterval);
      await confirmSwap(browser, page)
    }
  }, 2000);
}

async function confirmSwap(browser, page) {
  const popupConfirmPage = new Promise(x => browser.once('targetcreated', target => x(target.page())));

  console.log('Pre swap Confirmation clicked');
  await page.click(DODO_PRE_SWAP);

  const confirmPage = await popupConfirmPage;
  await confirmPage.waitForSelector(DODOD_CONFIRM_SWAP);

  const btn = await confirmPage.$(DODOD_CONFIRM_SWAP);
  const innerHtml = await confirmPage.evaluate(el => el.innerHTML, btn);
  console.log('Confirm swap Selector found');
  console.log(innerHtml);
  await confirmPage.click(DODOD_CONFIRM_SWAP);
  console.log('Swap window closed');
  
  await page.waitForSelector(DODO_AFTER_SWAP_BUTTON);
  console.log('After confirm button');
  await page.click(DODO_AFTER_SWAP_BUTTON);
  console.log('After confirm button clicked');
}
