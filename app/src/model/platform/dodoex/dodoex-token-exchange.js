import { LoggingService } from "../../../service/logging-service.js";

export class DodoExTokenExchange {
  #setting;
  #service;
  #pptr;
  #selectors;

  constructor(setting, service) {
    this.#setting = setting;
    this.#service = service;
    this.#pptr = service.puppeteerService;
    this.#selectors = this.#setting.exchangeSelectors();
  }

  async setupTokenPair(page, sourceToken, targetToken) {
    LoggingService.starting("Setting up token pair...");
    const _selectors = this.#selectors.exchangeForm;
    const _pptrService = this.#pptr;
    let _tokenText = "";

    LoggingService.processing("Waiting for tokens...");
    await page.waitForSelector(_selectors.sourceTokenSymbol);
    await page.waitForSelector(_selectors.targetTokenSymbol);

    LoggingService.processing("Selecting source token...");
    _tokenText = await _pptrService.getInnerHTML(page, _selectors.sourceTokenSymbol);
    if(_tokenText.trim() != sourceToken.trim()) {
      await page.click(_selectors.sourceTokenSymbol);
      await this._selectTokenFromSearch(page, sourceToken);
    }

    LoggingService.success("Source token found...");
    LoggingService.processing("Selecting target token...");
    _tokenText = await _pptrService.getInnerHTML(page, _selectors.targetTokenSymbol);
    if(_tokenText.trim() != targetToken.trim()) {
      await page.click(_selectors.targetTokenSymbol);
      await this._selectTokenFromSearch(page, targetToken);
    }

    LoggingService.success("Target token found...");
    LoggingService.success("Tokens are all set");
    return await Promise.resolve(true);
  }

  async checkTokenPair(page, sourceToken, targetToken) {
    LoggingService.starting("Checking token pair setting...")
    const _selectors = this.#selectors.exchangeForm;
    const _pptrService = this.#pptr;

    LoggingService.processing("Waiting for tokens...")
    await page.waitForSelector(_selectors.sourceTokenSymbol);
    await page.waitForSelector(_selectors.targetTokenSymbol);

    LoggingService.processing("Evaluating token selection...")
    const _sourceTokenText = await _pptrService.getInnerHTML(
      page,
      _selectors.sourceTokenSymbol
    );
    const _targetTokenText = await _pptrService.getInnerHTML(
      page,
      _selectors.targetTokenSymbol
    );

    return await Promise.resolve(
      sourceToken == _sourceTokenText &&
      targetToken == _targetTokenText
    );
  }

  async prepare(page, sourceTokenValue) {
    LoggingService.starting("Preparing exchange...");
    const _tokenValue = sourceTokenValue.toString();
    const _pptrService = this.#pptr;
    const _selectors = this.#selectors.exchangeForm;
    const _preConfirmExchangeButton = _selectors.button.preConfirmExchange;

    LoggingService.processing("Settting token value...");
    await _pptrService.resetInput(page, _selectors.input.sourceToken);
    await page.type(_selectors.input.sourceToken, _tokenValue, {delay: 100});
    await page.waitForSelector(_preConfirmExchangeButton);

    let _isButtonDisabled = true;
    let _retryCount = 1;
    let _retryMessage = "";
    const _allowedRetry = 60;

    while(_isButtonDisabled && _retryCount <= _allowedRetry) {
      _retryMessage = ` ${_retryCount} of ${_allowedRetry} ] Waiting to allow confirmation...`;
      LoggingService.processing(_retryMessage);
      await page.waitForTimeout(2000);
      _isButtonDisabled = await _pptrService.isElementDisabled(
        page,
        _preConfirmExchangeButton
      );

      _retryCount++;
    }

    if(_isButtonDisabled) {
      const _message = "Token exchange preparation failed...";
      LoggingService.processing(_message);
      throw new Error(_message);
    }

    LoggingService.processing("Token is ready for exchange...");
    return await Promise.resolve(true);
  }
  
  async approve(browser, page) {
    try {
      
      const _popupConfirmPage = new Promise(x => browser.once(
        'targetcreated', target => x(target.page())
      ));
      const _pptrService = this.#pptr;
      const _selectors = this.#selectors.exchangeForm;
      const _preConfirmExchangeButton = _selectors.button.preConfirmExchange;
      const _exchangeConfirmButton = _selectors.button.confirmExchange;
      const _exchangeRejectButton = _selectors.button.rejectExchange;

      LoggingService.starting("Token approval starting...");
      await page.click(_preConfirmExchangeButton);

      LoggingService.processing("Confirming amount...");
      const _confirmPage = await _popupConfirmPage;
      await _confirmPage.waitForSelector(_exchangeConfirmButton);
      const _isApproveButtonDisabled = await _pptrService.isElementDisabled(
        _confirmPage,
        _exchangeConfirmButton
      );

      if(_isApproveButtonDisabled) {
        const _message = "Exchange approval failed...";
        LoggingService.error(_message);
        LoggingService.error("Please check your balance and try again");
        await _confirmPage.click(_exchangeRejectButton);
        throw new Error(_message);
      }

      LoggingService.processing("Processing exchange...");
      await _confirmPage.click(_exchangeConfirmButton);

      LoggingService.processing("Exchange approved...");
      LoggingService.processing("Confirming approval...");
      
      const _isExchangeApproved = await this._checkApproval(page);
      LoggingService.closing(
        (_isExchangeApproved)? 
        "Exchange completed":
        "Failed to process the exchange"
      );
      
      return await Promise.resolve(_isExchangeApproved);

    } catch (e) {
      
      LoggingService.error("Token exchange approval error");
      LoggingService.errorMessage(e);
      LoggingService.closing("Please check the input and setting then try again...");
      return await Promise.resolve(false);
    }
  }

  async _checkApproval(page) {
    const _pptrService = this.#pptr;
    const _selectors = this.#selectors;
    const _success = _selectors.afterExchange.success;
    const _error = _selectors.afterExchange.error;

    const _afterExchangeButton = _success.dialogConfirmButton;
    const _upperRightErrorMessage = _error.upperRightModalMessage;
    const _errorConfirmButton = _error.dialogErrorConfirmButton;

    try {
      await page.waitForSelector(_afterExchangeButton);
      await page.click(_afterExchangeButton);
      return await Promise.resolve(true);

    } catch (e) {
      await page.waitForTimeout(2000);
      await page.waitForSelector(_upperRightErrorMessage);
      const _message = await _pptrService.getInnerHTML(
        page,
        _upperRightErrorMessage
      );

      LoggingService.error("Token exchange encountered an error");
      LoggingService.errorMessage(_message);
      LoggingService.errorMessage(e);

      await page.waitForTimeout(2000);
      await page.click(_errorConfirmButton);
      return await Promise.resolve(false);
    }
  }

  async _selectTokenFromSearch(page, token) {
    try {
      
      LoggingService.processing(`Searching for '${token}' token...`);
      const _selectors = this.#selectors.tokenSearch;
      const _pptrService = this.#pptr;

      LoggingService.processing('Inputting symbol...');
      await page.type(_selectors.searchField, token, {delay: 100});
      await page.waitForTimeout(2000);

      LoggingService.processing('Waiting for the result...');
      await page.waitForSelector(
        _selectors.firstResultText,
        { timeout: 10000 }
      );
      //TODO Add token address manually when error occurred
      const _firstResultTokenText = await _pptrService
      .getInnerHTML(
        page,
        _selectors.firstResultText
      );

      LoggingService.processing('Matching search result...');
      if(_firstResultTokenText.trim() !== token.trim()) {
        const _message = `Failed to find '${token}' token...`;
        LoggingService.error(_message);
        LoggingService.error("Please check your setting and try again");
        throw new Error(_message);
      }

      LoggingService.processing('Checking if token can be selected...');
      const _isTokenDisabled = await _pptrService.isElementDisabled(
        page,
        _selectors.firstResultText
      );

      await page.waitForTimeout(2000);
      await page.click(((_isTokenDisabled) ?
        _selectors.exitSearchButton :
        _selectors.firstResultText
      ));

      return await Promise.resolve(true);

    } catch (e) {

      const _message = `Searching for ${token} token failed`
      LoggingService.error(_message);
      LoggingService.error("Please check your setting and try again");
      LoggingService.errorMessage(e);
      throw new Error(_message);
    }
  }
}