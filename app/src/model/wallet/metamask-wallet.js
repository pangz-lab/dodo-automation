import { WalletInterface } from "../../../lib/model/wallet-interface.js";
import { LoggingService } from "../../service/logging-service.js"
import { AppService } from  "../../service/app-service.js";

export class MetaMaskWallet extends WalletInterface {
  #setting;
  #appService;
  #puppeteerService;

  constructor(setting) {
    super();
    this.#setting = setting;
    this.#appService = new AppService();
    this.#puppeteerService = this.#appService.puppeteerService;
  }

  browserSetting() {
    return this.#setting.browserSetting();
  }

  userAccount() {
    return this.#setting.userAccount();
  }

  _isUnlocked(page) {
    const _url = page.url();
    return !(_url.slice(-4) == 'unlock');
  }

  async _isNetworkSet(page, tokenSymbolSelector) {
    const _mainTokenSymbol = this.#setting.chainTokenSymbol();
    const _activeWalletTokenSymbol = await this
    .#puppeteerService
    .getElementProperty(
      page,
      tokenSymbolSelector,
      element => element.innerHTML
    );

    const _mainTokenSymbolExist = (
      _activeWalletTokenSymbol.trim() === _mainTokenSymbol.trim()
    );

    if(!_mainTokenSymbolExist) {
      const _message = `Smartchain "${_mainTokenSymbol}" network must be setup`;
      LoggingService.error(_message);
      throw new Error(_message);
    }

    return await Promise.resolve(true);
  }

  async login(page) {
    const _password = this.userAccount().password;
    const _selector = this.browserSetting().selector;
    const _passwordField = _selector.passwordField;

    await this.#puppeteerService.resetInput(page, _passwordField);
    await page.type(_passwordField, _password, {delay: 100});
    await page.click(_selector.loginButton , {delay: 3000});

    const loginStatus = await this._confirmLogin(
      page,
      _selector.binanceTokenSymbol
    );

    return await Promise.resolve(loginStatus);
  }

  async _confirmLogin(page, tokenSymbolSelector) {
    try {
      LoggingService.processing("Confirming network account...");
      await page.waitForSelector(
        tokenSymbolSelector, {
        timeout: 8000
      });

      const _isNetworkSet = await this._isNetworkSet(page, tokenSymbolSelector);
      return await Promise.resolve(
        this._isUnlocked(page) && 
        _isNetworkSet
      );

    } catch (e) {

      LoggingService.error('Wallet confirmation failed');
      LoggingService.error('Account not accepted');
      LoggingService.error('Please recheck the wallet configuration and try again');
      LoggingService.errorMessage(e);
      return await Promise.resolve(false);
    }
  }
}