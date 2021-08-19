import { WalletInterface } from "../../../lib/model/wallet-interface.js";
import { LoggingService } from "../../service/logging-service.js"
import { AppService } from  "../../service/app-service.js";

export class MetaMaskWallet extends WalletInterface {
  #setting;
  #appService;
  #pptrService;
  #selectors;

  constructor(setting) {
    super();
    this.#setting = setting;
    this.#appService = new AppService();
    this.#pptrService = this.#appService.puppeteerService;
    this.#selectors = this.#setting.selectors();
  }

  async login(page) {
    const _password = this.userAccount().password;
    const _selector = this.browserSetting().selector;
    const _passwordField = _selector.passwordField;

    await this.#pptrService.resetInput(page, _passwordField);
    await page.type(_passwordField, _password, {delay: 100});
    await page.click(_selector.loginButton , {delay: 3000});

    const loginStatus = await this._confirmLogin(page);

    return await Promise.resolve(loginStatus);
  }

  async approveTransaction(browser, page, operation) {
    const _op = {
      lc: operation.toLowerCase(),
      uc1st: operation,
    };

    try {
      const _popupConfirmPage = new Promise(x => browser.once(
        'targetcreated', target => x(target.page())
      ));
      const _pptrService = this.#pptrService;
      const _selectors = this.#selectors.approvalScreen;
      const _confirmButton = _selectors.confirmButton;
      const _rejectButton = _selectors.rejectButton;

      const _confirmPage = await _popupConfirmPage;
      await _confirmPage.waitForSelector(_confirmButton);
      const _isApproveButtonDisabled = await _pptrService.isElementDisabled(
        _confirmPage,
        _confirmButton
      );

      if(_isApproveButtonDisabled) {
        const _message = `${_op.uc1st} approval failed...`;
        LoggingService.error(_message);
        LoggingService.error("Please check your balance and try again");
        await _confirmPage.click(_rejectButton);
        throw new Error(_message);
      }

      LoggingService.processing(`Processing ${_op.lc}...`);
      await _confirmPage.click(_confirmButton);

      LoggingService.processing(`${_op.uc1st} approved...`);
      LoggingService.processing("Confirming approval...");
      
      return await Promise.resolve(true);

    } catch (e) {
      
      LoggingService.error(`${_op.uc1st} approval error`);
      LoggingService.errorMessage(e);
      LoggingService.closing("Please check the input and setting then try again...");
      return await Promise.resolve(false);
    }
  }
  
  userAccount() {
    return this.#setting.userAccount();
  }
  
  browserSetting() {
    return this.#setting.browserSetting();
  }

  async _confirmLogin(page) {
    try {
      
      LoggingService.processing("Confirming network account...");
      const _tokenSymbolSelector = this.browserSetting()
      .selector
      .binanceTokenSymbol;
      await page.waitForSelector(
        _tokenSymbolSelector, {
        timeout: 8000
      });

      const _isNetworkSet = await this._isNetworkSet(
        page,
        _tokenSymbolSelector
      );

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

  _isUnlocked(page) {
    const _url = page.url();
    return !(_url.slice(-4) == 'unlock');
  }

  async _isNetworkSet(page, tokenSymbolSelector) {

    const _mainTokenSymbol = this.#setting.chainTokenSymbol();
    const _activeWalletTokenSymbol = await this
    .#pptrService
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
}