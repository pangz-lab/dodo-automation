import { BlockchainPlatformInterface } from "../../../../lib/model/blockchain-platform-interface.js";
import { DodoExTokenExchange } from "./dodoex-token-exchange.js";
import { AppService } from  "../../../service/app-service.js";
import { LoggingService } from "../../../service/logging-service.js"
import { AppConfig } from "../../../config/app-config.js";
import { ChainTokenPair } from "../../chain-token-pair.js";

export class DodoExPlatform 
  extends BlockchainPlatformInterface {
  #setting;
  #browser;
  #appService;
  #browserLaunchSetting;
  #puppeteerService;
  #tokenSwap;
  #wallet;

  constructor(setting) {
    LoggingService.starting('DodoExPlatform starting..');
    super();
    this.#setting = setting;
    this.#wallet = this.#setting.wallet;
    this.#appService = new AppService();
    this.#tokenSwap = new DodoExTokenExchange(
      this.#setting,
      this.#appService
    );
    this.#puppeteerService = this.#appService.puppeteerService;

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
      //TODO check app folder path
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
      this.#wallet
        .browserSetting()
        .extension
        .url
    );

    const page = await metaMaskTab.page();
    await page.bringToFront();

    let _loginAttempt = 1;
    let _loginSuccessful = false;
    let retryCount = AppConfig.LOGIN_RETRY;

    while(!_loginSuccessful && _loginAttempt <= retryCount) {
      LoggingService.processing('[ '+_loginAttempt+' of '+retryCount+' ] Trying to login...');
      _loginSuccessful = await this.#wallet.login(page);
      _loginAttempt++;
    }

    if(!_loginSuccessful) {
      LoggingService.error('Wallet login failed...');
      LoggingService.error('Closing connection...');
      this._exit();
    }

    LoggingService.success('Wallet connected...');
    await page.close();
    return await Promise.resolve(true);
  }

  async swapToken(tokenPair)  {
    const _pair = new ChainTokenPair(tokenPair);
    const sourceToken = _pair.source;
    const targetToken = _pair.target;

    try {
      LoggingService.starting("Token swap starting...");
      LoggingService.processing("Checking token pair...");

      if(!_pair.exist()) {
        const _message = `Token pair '${tokenPair}' does not exist`;
        LoggingService.error(_message);
        LoggingService.error("Please check your configuration and try again");
        throw new Error(_message);
      }

      LoggingService.processing("Token pair configuration found...");
      const dodoPage = await this.#browser.newPage();
      await dodoPage.goto(
        this.#setting.tokenExchangeURL(
          sourceToken.name,
          targetToken.name
        )
      );

      await dodoPage.bringToFront();
      let _retryCount = 0;
      const _allowedRetry = 2;

      let _correctPair = await this.#tokenSwap
      .checkTokenPair(
        dodoPage,
        sourceToken.name,
        targetToken.name
      );

      while(!_correctPair && _retryCount <= _allowedRetry) {
        LoggingService.warning("Incorrect token set, updating...");
        await this.#tokenSwap.setupTokenPair(
          dodoPage,
          sourceToken.name,
          targetToken.name
        );

        _correctPair = await this.#tokenSwap.checkTokenPair(
          dodoPage,
          sourceToken.name,
          targetToken.name
        );
        _retryCount++;
      }

      if(!_correctPair) {
        LoggingService.error("Token pair is unexpected");
        LoggingService.error("Please check your wallet and DODO setting then try again.");
        this._exit();
        return await Promise.resolve(false);
      }

      LoggingService.success("Token pair confirmed...");
      await this.#tokenSwap.prepare(dodoPage, sourceToken.value);
      await this.#tokenSwap.approve(this.#browser, dodoPage);

    } catch(e) {
      LoggingService.error("Error swapping tokens");
      LoggingService.errorMessage(e);
      this._exit();
    }
  }

  rebalancePool(sourceToken, destinationToken)  { }

  async _exit() {
    LoggingService.closing('DodoExPlatform closing..');
    await this.#browser.close();
  }
}