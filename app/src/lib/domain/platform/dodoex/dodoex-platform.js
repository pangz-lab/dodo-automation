import { BlockchainPlatformInterface } from "../../../model/interface/blockchain-platform-interface.js";
import { DodoExTokenExchange } from "./dodoex-token-exchange.js";
import { DodoExPoolRebalance } from "./dodoex-pool-rebalance.js";
import { AppConfig } from "../../../config/app-config.js";
import { AppService } from  "../../../service/app-service.js";
import { LoggingService } from "../../../service/logging-service.js"
import { ChainTokenPair } from "../../../model/chain-token-pair.js";
import { ChainToken } from "../../../model/chain-token.js";
import { ChainPool } from "../../../model/chain-pool.js";

export class DodoExPlatform 
  extends BlockchainPlatformInterface {
  #setting;
  #browser;
  #appService;
  #browserLaunchSetting;
  #pptrService;
  #tokenExchange;
  #poolRebalance;
  #wallet;
  #activeServer;
  #requiredSteps = {
    initialSetup: false,
    walletConnection: false,
  };

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
    this.#poolRebalance = new DodoExPoolRebalance(
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
      args: [
        `--disable-extensions-except=${_extensionPath}`,
        `--load-extension=${_extensionPath}`,
        `--user-data-dir=${_profileDataPath}`,
      ],
    };
  }

  async preSetup(message) {
    await this.setup();
    const _browser = this.#browser;
    const _page = await _browser.newPage();
    await _page.goto('https://paste.sh/');
    await _page.waitForSelector("#x");
    
    const _el = await _page.$('#x');
    await _el.type((message == undefined) ? "" : message);
    return _page;
  }

  async setup() {
    try {
      //TODO check app folder path
      LoggingService.processing('Setting up...');
      this.#browser = await this
        .#appService
        .puppeteer
        .launch(this.#browserLaunchSetting);

      this.#requiredSteps.initialSetup = true;
      LoggingService.success('Setup successful...');
      return await Promise.resolve(true);

    } catch (e) {

      const _log = 'Setup failed...';
      LoggingService.error(_log);
      LoggingService.errorMessage(e);
      LoggingService.closing('DodoExPlatform closing...');
      throw new Error(_log);
    }
  }

  async openWallet() {
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
    return page;
  }

  async connectToWallet(account) {
    try {
      const page = await this.openWallet();

      let _loginAttempt = 1;
      let _loginSuccessful = false;
      let retryCount = AppConfig.LOGIN_RETRY;

      while(!_loginSuccessful && _loginAttempt <= retryCount) {
        LoggingService.processing('[ '+_loginAttempt+' of '+retryCount+' ] Trying to login...');
        _loginSuccessful = await this.#wallet.login(page, account);
        _loginAttempt++;
      }

      if(!_loginSuccessful) {
        LoggingService.error('Wallet login failed...');
        LoggingService.error('Closing connection...');
        this._exit();
      }

      this.#requiredSteps.walletConnection = true;
      LoggingService.closing('Wallet connected...');
      await page.close();
      return await Promise.resolve(true);

    } catch(e) {
      LoggingService.error("Failed connection to wallet");
      LoggingService.errorMessage(e);
      this._exit();
    }
  }

  async prepareTokenExchange() {
    const _server = this._getActiveServer();
    await _server.page.bringToFront();
    const _pair = _server.tokenPair;
    const _operation = "Token Exchange";
    const _messageOpComplete = `${_operation} completed`;
    const _dodoPage = _server.page;
    await this.#tokenExchange.prepare(_dodoPage, _pair);

    return {
      operation: _operation,
      dodoPage: _dodoPage,
      messageOpComplete: _messageOpComplete
    };
  }

  async exchangeToken()  {
    try{
      this._setupPreCheck();
      LoggingService.starting("Token Exchange starting...");
      // const _server = this._getActiveServer();
      // await _server.page.bringToFront();
      // const _pair = _server.tokenPair;
      // const _operation = "Token Exchange";
      // const _messageOpComplete = `${_operation} completed`;
      // const _dodoPage = _server.page;
      // await this.#tokenExchange.prepare(_dodoPage, _pair);
      const p = await this.prepareTokenExchange();
      const _operation = p.operation;
      const _dodoPage = p.dodoPage;
      const _messageOpComplete = p.messageOpComplete;

      if(!await this.#tokenExchange.allowOperation()) {
        LoggingService.closing(_messageOpComplete);
        return await Promise.resolve(false);
      }

      await this.#tokenExchange.execute();
      await this.#wallet.approveTransaction(this.#browser, _dodoPage, _operation);
      await this._postApprovalCheck(_dodoPage, _operation);
      
      await _dodoPage.waitForTimeout(15000);
      LoggingService.closing(_messageOpComplete);
      return await Promise.resolve(true);

    } catch(e) {
      
      const _message = "Token Exchange error!";
      LoggingService.errorMessage(_message);
      throw new Error(e);
    }
  }

  async preparePoolRebalance() {
    const _server = this._getActiveServer();
    await _server.page.bringToFront();
    
    const _pool = _server.pool;
    const _dodoPage = _server.page;
    const _operation = "Pool Rebalance";
    await this.#poolRebalance.prepare(_dodoPage, _pool);
    return {
      dodoPage: _dodoPage,
      operation: _operation,
    }
  }

  async rebalancePool() {
    try {
      this._setupPreCheck();
      LoggingService.starting("Pool rebalance starting...");
      // const _server = this._getActiveServer();
      // await _server.page.bringToFront();

      // const _pool = _server.pool;
      // const _dodoPage = _server.page;
      // const _operation = "Pool Rebalance";
      // await this.#poolRebalance.prepare(_dodoPage, _pool);
      const p = await this.preparePoolRebalance();
      const _dodoPage = p.dodoPage;
      const _operation = p.operation;

      if(!await this.#poolRebalance.allowOperation()) {
        LoggingService.closing("Rebalance completed");
        return await Promise.resolve(false);
      }

      await this.#poolRebalance.execute();
      await this.#wallet.approveTransaction(this.#browser, _dodoPage, _operation);
      await this._postApprovalCheck(_dodoPage, _operation);
      
      await _dodoPage.waitForTimeout(15000);
      LoggingService.closing("Rebalance completed");
      return await Promise.resolve(true);

    } catch (e) {
      const _message = "Pool Rebalance error!";
      LoggingService.errorMessage(_message);
      throw new Error(e);
    }
  }

  useServer(server) {
    this._setActiveServer(server);
    return this;
  }

  async createServer(type, key) {
    this._setupPreCheck();
    let _server = {};
    switch(type) {
      case "tokenExchange":
        const _pair = this._getTokenPair(key);
        _server = {
          page: await this._prepareTokenExchangePage(_pair),
          key: key,
          tokenPair: _pair,
        };
        break;

      case "poolRebalance":
        const _pool = this._getPoolToken(key);
        _server = {
          page: await this._preparePoolRebalancePage(_pool.address),
          key: key,
          pool: _pool,
        };
        break;

      default:
        this._exit();
        throw new Error(`Server type does not exist : ${type}`);
    }

    return _server;
  }

  async showMessage(page, message) {
    await this.#pptrService.showAlert(page, message);
  }
  
  _setActiveServer(server) {
    this.#activeServer = server;
  }

  _getActiveServer() {
    return this.#activeServer;
  }

  async _prepareTokenExchangePage(pair) {
    LoggingService.processing("Preparing page...");
    const dodoPage = await this.#browser.newPage();
    const sourceToken = pair.source;
    const targetToken = pair.target;
    await dodoPage.goto(
      this.#setting.tokenExchangeURL(
        sourceToken.name,
        targetToken.name
      )
    );
    // await dodoPage.bringToFront();
    return dodoPage;
  }

  async _preparePoolRebalancePage(poolAddress) {
    LoggingService.processing("Preparing page...");
    const _dodoPage = await this.#browser.newPage();
    await _dodoPage.goto(
      this.#setting.poolRebalanceURL(poolAddress)
    );
    // await _dodoPage.bringToFront();
    return _dodoPage;
  }

  async _postApprovalCheck(page, operation) {
    const _pptrService = this.#pptrService;
    const _selectors = this.#setting.postApprovalOperationSelectors();
    const _success = _selectors.success;
    const _error = _selectors.error;

    const _postConfirmButton = _success.dialogConfirmButton;
    const _upperRightErrorMessage = _error.upperRightModalMessage;
    const _errorConfirmButton = _error.dialogErrorConfirmButton;

    try {
      await page.waitForSelector(_postConfirmButton);
      await page.click(_postConfirmButton);
      return await Promise.resolve(true);

    } catch (e) {

      await page.waitForTimeout(2000);
      await page.waitForSelector(_upperRightErrorMessage);
      const _message = await _pptrService.getInnerHTML(
        page,
        _upperRightErrorMessage
      );

      LoggingService.error(`${operation} encountered an error`);
      LoggingService.errorMessage(_message);
      LoggingService.errorMessage(e);

      await page.waitForTimeout(2000);
      await page.click(_errorConfirmButton);
      return await Promise.resolve(false);
    }
  }

  async _exit() {
    LoggingService.closing('DodoExPlatform closing..');
    await this.#browser.close();
  }

  async teardown() {
    await this._exit();
  }

  _setupPreCheck() {
    if(!this._requiredSetupIsComplete()) {
      const _message = "Required setup is not yet complete.";
      LoggingService.error("Initialize the platform setup and wallet connection first to proceed.");
      LoggingService.errorMessage(_message);
      throw new Error(_message);
    }
  }

  _getPoolToken(poolKey) {
    try {
      const _chain = this.#setting.chain();
      const _pool = _chain.pool[poolKey];
      const _tokenCollection = _chain.token.collection;
      const _tokenPair = _pool.tokenPair;
      const _sourceToken = _tokenCollection[_tokenPair.source.key];
      const _targetToken = _tokenCollection[_tokenPair.target.key];

      return new ChainPool({
        name: poolKey,
        address: _pool.address,
        tradeSpeedPercent: _pool.tradeSpeedPercent,
        source: new ChainToken({
          name: _tokenPair.source.key,
          value: _tokenPair.source.value,
          symbol: _sourceToken.symbol,
          address: _sourceToken.address,
        }),
        target: new ChainToken({
          name: _tokenPair.target.key,
          value: _tokenPair.target.value,
          symbol: _targetToken.symbol,
          address: _targetToken.address,
        })
      });

    } catch (e) {
      LoggingService.errorMessage("Configuration error. Please check chain config and try again");
      throw new Error("Pool configuration not found!");
    }
  }

  _requiredSetupIsComplete() {
    return this.#requiredSteps.initialSetup &&
    this.#requiredSteps.walletConnection
  }

  _validateTokenPair(pair) {
    LoggingService.processing("Validating token pair...");

    if(!pair.valid()) {
      const _message = `Token pair '${pair.name}' does not exist`;
      LoggingService.error(_message);
      LoggingService.error("Please check your chain config and try again");
      throw new Error(_message);
    }

    return true;
  }
  
  _getTokenPair(tokenPairKey) {
    try {
      const _token = this.#setting.chain().token;
      const _pair = _token.pair[tokenPairKey];
      const _collection = _token.collection;
      const _sourceToken = _collection[_pair.source];
      const _targetToken = _collection[_pair.target];

      return new ChainTokenPair({
        name: tokenPairKey,
        source: new ChainToken({
          name: _pair.source,
          value: _pair.valueRatio[0],
          symbol: _sourceToken.symbol,
          address: _sourceToken.address,
        }),
        target: new ChainToken({
          name: _pair.target,
          value: _pair.valueRatio[1],
          symbol: _targetToken.symbol,
          address: _targetToken.address,
        })
      });

    } catch (e) {
      LoggingService.errorMessage("Configuration error. Please check chain config and try again");
      throw new Error("Token pair not found!");
    }
  }
}