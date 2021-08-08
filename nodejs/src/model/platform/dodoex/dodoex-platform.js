import { BlockchainPlatformInterface } from "../../../lib/model/blockchain-platform-interface.js";

class DodoExPlatform extends BlockchainPlatformInterface {

  #setting;
  #browser;
  #appService;

  constructor(setting, appService) {
    this.#setting = setting;
    this.#appService = appService.puppeteer;
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

        console.log(this.#browser);

      return true;

    } catch (e) {
      const _log = '[error]: Failed platform login';
      LoggingService.text(e+' > '+_log);
      throw new Error(_log);
    }
  }

  connectToWallet() { }
  swapToken(sourceToken, destinationToken)  { }
  rebalancePool(sourceToken, destinationToken)  { }
}

export { DodoExPlatform };