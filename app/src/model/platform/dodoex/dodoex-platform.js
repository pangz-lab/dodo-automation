import { BlockchainPlatformInterface } from "../../../../lib/model/blockchain-platform-interface.js";
import { DodoExTokenExchange } from "./dodoex-token-exchange.js";
import { AppConfig } from "../../../config/app-config.js";
import { AppService } from  "../../../service/app-service.js";
import { LoggingService } from "../../../service/logging-service.js"
import { ChainTokenPair } from "../../chain-token-pair.js";

export class DodoExPlatform 
  extends BlockchainPlatformInterface {
  #setting;
  #browser;
  #appService;
  #browserLaunchSetting;
  #pptrService;
  #tokenExchange;
  #wallet;

  constructor(setting) {
    LoggingService.starting('DodoExPlatform starting..');
    super();
    this.#setting = setting;
    this.#wallet = this.#setting.wallet;
    this.#appService = new AppService();
    this.#tokenExchange = new DodoExTokenExchange(
      this.#setting,
      this.#appService
    );
    this.#pptrService = this.#appService.puppeteerService;

    const _walletBrowserSetting = this.#setting.wallet.browserSetting();
    const _extensionPath = _walletBrowserSetting.extension.path;
    const _profileDataPath = _walletBrowserSetting.userProfile.dataPath;
    this.#browserLaunchSetting = {
      headless: false,
      defaultViewport: null,
      //  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      args: [
        `--disable-extensions-except=${_extensionPath}`,
        `--load-extension=${_extensionPath}`,
        `--user-data-dir=${_profileDataPath}`,
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
      LoggingService.error(_log);
      LoggingService.error(e);
      LoggingService.closing('DodoExPlatform closing...');
      throw new Error(_log);
    }
  }

  async connectToWallet() {
    try {

      LoggingService.starting('Connecting to wallet...');
      const metaMaskTab = await this.#pptrService.findTabWithUrl(
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

    } catch(e) {
      LoggingService.error("Failed connecting to wallet");
      LoggingService.errorMessage(e);
      this._exit();
    }
  }

  async swapTokenTest(tokenPair) {
    const _pair = new ChainTokenPair(tokenPair);
    const _sourceToken = _pair.source;
    const _targetToken = _pair.target;
    const _dodoPage = await this._prepareExchange(_pair, _sourceToken, _targetToken);
  }

  async swapToken(tokenPair)  {
    try{
      const _pair = new ChainTokenPair(tokenPair);
      const _sourceToken = _pair.source;
      const _targetToken = _pair.target;
      const _dodoPage = await this._prepareExchange(_pair, _sourceToken, _targetToken);
    
      this._exchangeStatusMessage(false, 1, 1);
      await this._processExchange(_dodoPage, _sourceToken, _targetToken);
      await _dodoPage.waitForTimeout(20000);

    } catch(e) {

      LoggingService.error("Error swapping tokens");
      LoggingService.errorMessage(e);
      this._exit();
    }
  }

  async swapTokenInfinite(tokenPair)  {
    try{
      const _pair = new ChainTokenPair(tokenPair);
      const _sourceToken = _pair.source;
      const _targetToken = _pair.target;
      const _dodoPage = await this._prepareExchange(_pair, _sourceToken, _targetToken);
      let counter = 1;
      
      while(true) {
        this._exchangeStatusMessage(true, counter, 0);
        await this._processExchange(_dodoPage, _sourceToken, _targetToken);
        await _dodoPage.waitForTimeout(20000);
        counter++;
      }

    } catch(e) {

      LoggingService.error("Error swapping tokens");
      LoggingService.errorMessage(e);
      this._exit();
    }
  }

  async swapTokenUntil(tokenPair, exchangeCount)  {
    try{
      const _pair = new ChainTokenPair(tokenPair);
      const _sourceToken = _pair.source;
      const _targetToken = _pair.target;
      const _dodoPage = await this._prepareExchange(_pair, _sourceToken, _targetToken);
      let counter = 1;
      
      while(counter <= exchangeCount) {
        this._exchangeStatusMessage(false, counter, exchangeCount);
        await this._processExchange(_dodoPage, _sourceToken, _targetToken);
        await _dodoPage.waitForTimeout(20000);
        counter++;
      }

    } catch(e) {

      LoggingService.error("Error swapping tokens");
      LoggingService.errorMessage(e);
      this._exit();
    }
  }

  async _prepareExchange(pair, sourceToken, targetToken) {

    LoggingService.starting("Token swap starting...");
    LoggingService.processing("Checking token pair...");

    if(!pair.exist()) {
      const _message = `Token pair '${pair.name}' does not exist`;
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
    return dodoPage;
  }

  async _processExchange(dodoPage, sourceToken, targetToken) {
    const _exchangeIsReady = await this
    ._validateExchange(
      dodoPage,
      sourceToken,
      targetToken
    );

    if(_exchangeIsReady) {
      await this._executeExchange(dodoPage, sourceToken);
    }
  }

  async _validateExchange(dodoPage, sourceToken, targetToken) {
    let _retryCount = 0;
    const _allowedRetry = 2;

    let _correctPair = await this.#tokenExchange
    .checkTokenPair(
      dodoPage,
      sourceToken.name,
      targetToken.name
    );

    while(!_correctPair && _retryCount <= _allowedRetry) {
      LoggingService.warning("Incorrect token set, updating...");
      await this.#tokenExchange.setupTokenPair(
        dodoPage,
        sourceToken.name,
        targetToken.name
      );

      _correctPair = await this.#tokenExchange.checkTokenPair(
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

    return await Promise.resolve(true);
  }

  async _executeExchange(dodoPage, sourceToken) {
    LoggingService.success("Token pair confirmed...");
    await this.#tokenExchange.prepare(dodoPage, sourceToken.value);
    await this.#tokenExchange.approve(this.#browser, dodoPage);
    return await Promise.resolve(true);
  }

  rebalancePool(sourceToken, destinationToken)  { }

  async _exit() {
    LoggingService.closing('DodoExPlatform closing..');
    await this.#browser.close();
  }

  _exchangeStatusMessage(isInfinite, currentIteration, allowedIteration) {
    LoggingService.starting(
      `Exchanging from ${currentIteration} to `+((isInfinite)? 'infinity': allowedIteration)
    );
  }
}