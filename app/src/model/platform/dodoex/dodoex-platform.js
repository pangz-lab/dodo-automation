import { BlockchainPlatformInterface } from "../../../../lib/model/blockchain-platform-interface.js";
import { DodoExTokenExchange } from "./dodoex-token-exchange.js";
import { LoggingService } from "../../../service/logging-service.js";
import { AppService } from  "../../../service/app-service.js";
import { AppConfig } from "../../../config/app-config.js";

export class DodoExPlatform
    extends BlockchainPlatformInterface {
  #setting;
  #browser;
  #browserLaunchSetting;
  #appService;
  #puppeteerService;
  #tokenSwap;

  constructor(setting) {
    LoggingService.starting('DodoExPlatform starting..');
    super();
    const appService = new AppService();
    this.#setting = setting;
    this.#appService = appService;
    this.#puppeteerService = appService.puppeteerService;
    this.#tokenSwap = new DodoExTokenExchange(
      this.#setting,
      this.#appService
    );

    const _walletBrowserSetting = this.#setting.wallet.browserSetting();
    const _extensionPath = _walletBrowserSetting.extension.path;
    const _profileDataPath = _walletBrowserSetting.userProfile.dataPath;
    this.#browserLaunchSetting = {
      headless: false,
      defaultViewport: null,
      args: [
        `--disable-extensions-except=${_extensionPath}`,
        `--load-extension=${_extensionPath}`,
        `--user-data-dir=${_profileDataPath}`
      ],
    };
  }

  async setup() {
    try {

      LoggingService.success('Setting up...');
      this.#browser = await this
          .#appService
          .puppeteer
          .launch(this.#browserLaunchSetting);

      LoggingService.success('Setup successful...');
      return await Promise.resolve(true);

    } catch (e) {

      const _log = 'Setup failed...';
      LoggingService.error(log);
      LoggingService.error(e);
      LoggingService.closing('DodoExPlatform closing...');
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
          this._exit();
      }

      LoggingService.success('Wallet login successful...');
      await page.close();
      return await Promise.resolve(true);
  }

  async swapToken(sourceToken, targetToken)  {
    try {
      LoggingService.starting("Token swap starting...");
      const dodoPage = await this.#browser.newPage();
      await dodoPage.goto(
        this.#setting.tokenExchangeURL(
          sourceToken,
          targetToken
        )
      );

      await dodoPage.bringToFront();
      let _correctPair = await this.#tokenSwap.checkTokenPair(
        dodoPage,
        sourceToken,
        targetToken
      );
      let _retryCount = 0;
      const _retryAllowed = 2;

      while(!_correctPair && _retryCount <= _retryAllowed) {
        await this.#tokenSwap.setupTokenPair(
          dodoPage,
          sourceToken,
          targetToken
        );

        _correctPair = await this.#tokenSwap.checkTokenPair(
          dodoPage,
          sourceToken,
          targetToken
        );
        _retryCount++;
        if(_retryCount == 2 && !_correctPair) {
          LoggingService.error("Token pair is unexpected");
          LoggingService.error("Please check your wallet and DODO setting then try again.");
          this._exit();
          return await Promise.resolve(false);
        }
      }

      LoggingService.success("Token pair confirmed...");
      await this.#tokenSwap.prepare(dodoPage, 1);
      await this.#tokenSwap.approve(this.#browser, dodoPage);

    } catch(e) {
      LoggingService.error("Error swapping tokens");
      LoggingService.errorMessage(e);
      this._exit();
    }
  }

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
      await page.waitForSelector(
        tokenSymbolSelector, {
        timeout: 8000
      });

      if(this.#setting.wallet.isUnlocked(page)) {
        return await Promise.resolve(true);
      }

      const activeWalletTokenSymbol = await this
        ._puppeteerService()
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

  async _exit() {
    LoggingService.closing('DodoExPlatform closing..');
    await this.#browser.close();
  }

  _puppeteerService() {
    return this.#puppeteerService;
  }
}