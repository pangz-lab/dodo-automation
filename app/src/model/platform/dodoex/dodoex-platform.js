import { BlockchainPlatformInterface } from "../../../../lib/model/blockchain-platform-interface.js";
import { LoggingService } from "../../../service/logging-service.js";

export class DodoExPlatform extends BlockchainPlatformInterface {
  #setting;
  #browser;
  #appService;
  #puppeteerService;

  constructor(setting, appService) {
    super();
    this.#setting = setting;
    this.#appService = appService;
    this.#puppeteerService = appService.puppeteerService;
  }

  async setup() {
    try {
      const setting = this.#setting;
      const puppeteer = this.#appService.puppeteer;

      const extensionPath = setting.wallet.browserSetting().extension.path;
      const profileDataPath = setting.wallet.browserSetting().userProfile.dataPath;
      this.#browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
          `--start-maximized`,
          `--disable-extensions-except=${extensionPath}`,
          `--load-extension=${extensionPath}`,
          `--user-data-dir=${profileDataPath}`
        ],
      });
      return true;

    } catch (e) {
      const _log = '[error]: Failed platform login';
      LoggingService.text(e+' > '+_log);
      throw new Error(_log);
    }
  }

  async connectToWallet() {
    const metaMaskTab = await this.#puppeteerService.findTabWithUrl(
      this.#browser,
      this.#setting.wallet.browserSetting().extension.url
    );

    const page = await metaMaskTab.page();
    await page.bringToFront();

    const loginSuccessful = this._login(page);
    if(!loginSuccessful) {await this._browser.close();}
  
    await page.close();
    return true;
  }
  
  swapToken(sourceToken, destinationToken)  { }
  rebalancePool(sourceToken, destinationToken)  { }
}