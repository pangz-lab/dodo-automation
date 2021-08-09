import { BlockchainPlatformInterface } from "../../../../lib/model/blockchain-platform-interface.js";
import { LoggingService } from "../../../service/logging-service.js";
import { AppConfig } from "../../../config/app-config.js";

export class DodoExPlatform extends BlockchainPlatformInterface {
  #setting;
  #browser;
  #browserLaunchSetting;
  #appService;
  #puppeteerService;

  constructor(setting, appService) {
    LoggingService.starting('DodoExPlatform starting..');
    super();
    this.#setting = setting;
    this.#appService = appService;
    this.#puppeteerService = appService.puppeteerService;

    const extensionPath = this.#setting.wallet.browserSetting().extension.path;
    const profileDataPath = this.#setting.wallet.browserSetting().userProfile.dataPath;
    this.#browserLaunchSetting = {
      headless: false,
      defaultViewport: null,
      args: [
        `--start-maximized`,
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        `--user-data-dir=${profileDataPath}`
      ],
    };
  }

  async setup() {
    try {
      
      LoggingService.success('Setting up..');
      const puppeteer = this.#appService.puppeteer;
      this.#browser = await puppeteer.launch(this.#browserLaunchSetting);
      
      LoggingService.success('Setup successful...');
      return await Promise.resolve(true);

    } catch (e) {

      const _log = 'Setup failed..';
      LoggingService.error(log);
      LoggingService.error(e);
      LoggingService.closing('DodoExPlatform closing..');
      throw new Error(_log);
    }
  }

  async connectToWallet() {
    LoggingService.starting('Connecting to wallet...');
    const metaMaskTab = await this.#puppeteerService.findTabWithUrl(
      this.#browser,
      this.#setting.wallet.browserSetting().extension.url
    );

    const page = await metaMaskTab.page();
    await page.bringToFront();
    
    let _loginAttempt = 1;
    let _loginSuccessful = false;
    let retryCount = AppConfig.LOGIN_RETRY;

    while(!_loginSuccessful && _loginAttempt <= retryCount) {
      LoggingService.processing('[ '+_loginAttempt+' of '+retryCount+' ] Trying to login...');
      _loginSuccessful = await this._login(page);
      _loginAttempt++;
    }

    if(!_loginSuccessful) {
      LoggingService.error('Wallet login failed...');
      LoggingService.error('Closing connection...');
      LoggingService.closing('DodoExPlatform closing..');
      return await this.#browser.close();
    }

    LoggingService.success('Wallet login successful...');
    await page.close();
    return await Promise.resolve(true);
  }

  swapToken(sourceToken, destinationToken)  { }
  rebalancePool(sourceToken, destinationToken)  { }

  
  async _login(page) {
    const _password = this.#setting.wallet.userAccount().password;
    const _selector = this.#setting.wallet.browserSetting().selector;
    const _passwordField = _selector.passwordField;
    
    await this._puppeteerService().resetInput(page, _passwordField);
    await page.type(_passwordField, _password, {delay: 100});
    await page.click(_selector.loginButton , {delay: 3000});

    const loginStatus = await this._confirmLogin(
      page,
      _selector.binanceTokenSymbol,
      this.#setting.wallet.mainTokenSymbol
    );

    return await Promise.resolve(loginStatus);
  }

  async _confirmLogin(page, tokenSymbolSelector, mainTokenSymbol) {

    try {
      await page.waitForSelector(tokenSymbolSelector, {
        timeout: 8000
      });

      if(this.#setting.wallet.isUnlocked(page)) {
        return await Promise.resolve(true);
      }

      const activeWalletTokenSymbol = await this._puppeteerService()
      .getElementProperty(
        page,
        tokenSymbolSelector,
        element => element.innerHTML
      );

      const mainTokenSymbolExist = (
        activeWalletTokenSymbol.trim() === mainTokenSymbol.trim()
      );

      return await Promise.resolve(mainTokenSymbolExist);
      
    } catch (e) {

      LoggingService.processing('Account not accepted...');
      return await Promise.resolve(false);
    }
  }

  _puppeteerService() {
    return this.#puppeteerService;
  }
}