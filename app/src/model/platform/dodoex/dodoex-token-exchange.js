import { LoggingService } from "../../../service/logging-service.js";

export class DodoExTokenExchange {
  #service;
  #page;
  #tokenPair;
  #setting;
  #selectors;
  #pptrService;

  constructor(setting, service) {
    this.#setting = setting;
    this.#service = service;
    this.#pptrService = service.puppeteerService;
    this.#selectors = this.#setting.exchangeSelectors();
  }

  async prepare(page, tokenPair) {
    LoggingService.starting("Preparing exchange...");
    this.#page = page;
    this.#tokenPair = tokenPair;

    try {
      const _allowedRetry = 2;
      let _retryCount = 0;
      let _correctPair = await this._checkTokenPair();

      while(!_correctPair && _retryCount <= _allowedRetry) {
        
        LoggingService.warning("Incorrect token set...");
        LoggingService.processing("Updating the token pair manually...");
        await this._setupTokenPair();

        _correctPair = await this._checkTokenPair();
        _retryCount++;
      }

      if(!_correctPair) {
        const _message = "Please check your chain config then try again!";
        LoggingService.error("Token pair is unexpected");
        LoggingService.error(_message);
        throw new Error(_message);
      }

      return await Promise.resolve(true);

    } catch(e) {
      const _message = "Error occured during token exchange preparation.";
      LoggingService.errorMessage(_message);
      throw new Error(e);
    }
  }

  async allowOperation() {
    return await Promise.resolve(true);
  }

  async execute() {
    const page = this.#page;
    const sourceToken = this.#tokenPair.source;
    const _allowedRetry = 60;
    const _tokenValue = sourceToken.value.toString();
    const _pptrService = this.#pptrService;
    const _selectors = this.#selectors.exchangeForm;
    const _preConfirmExchangeButton = _selectors.preConfirmExchangeButton;
    const _sourceTokenInputField = _selectors.sourceTokenInputField;
    const _postRetryMessage = "Waiting to allow confirmation...";

    LoggingService.processing("Settting token value...");

    await _pptrService.clearInput(page, _sourceTokenInputField);
    await page.type(_sourceTokenInputField, _tokenValue, {delay: 100});
    await page.waitForSelector(_preConfirmExchangeButton);

    let _confirmButtonIsDisabled = true;
    let _retryCount = 1;
    let _retryMessage = "";

    while(_confirmButtonIsDisabled && _retryCount <= _allowedRetry) {
      _retryMessage = `[ ${_retryCount} of ${_allowedRetry} ] ${_postRetryMessage}`;
      
      LoggingService.processing(_retryMessage);

      await page.waitForTimeout(2000);
      _confirmButtonIsDisabled = await _pptrService
      .isElementDisabled(
        page,
        _preConfirmExchangeButton
      );

      _retryCount++;
    }

    if(_confirmButtonIsDisabled) {
      const _message = "Token exchange preparation failed...";
      LoggingService.processing(_message);
      throw new Error(_message);
    }

    LoggingService.processing("Token is ready for exchange...");
    LoggingService.processing("Confirming...");
    await page.click(_preConfirmExchangeButton);
    return await Promise.resolve(true);
  }

  async _setupTokenPair() {
    LoggingService.starting("Setting up token pair...");
    const page = this.#page;
    const sourceToken = this.#tokenPair.source.name;
    const targetToken = this.#tokenPair.target.name;

    const _selectors = this.#selectors.exchangeForm;
    const _pptrService = this.#pptrService;
    let _tokenText = "";

    LoggingService.processing("Waiting for tokens...");
    await page.waitForSelector(_selectors.sourceTokenSymbol);
    await page.waitForSelector(_selectors.targetTokenSymbol);

    LoggingService.processing("Selecting source token...");
    _tokenText = await _pptrService.getInnerHTML(
      page,
      _selectors.sourceTokenSymbol
    );

    if(_tokenText.trim() != sourceToken.trim()) {
      await page.click(_selectors.sourceTokenSymbol);
      await this._selectTokenFromSearch(sourceToken);
    }

    LoggingService.success("Source token found...");
    LoggingService.processing("Selecting target token...");

    _tokenText = await _pptrService
    .getInnerHTML(
      page,
      _selectors.targetTokenSymbol
    );

    if(_tokenText.trim() != targetToken.trim()) {
      await page.click(_selectors.targetTokenSymbol);
      await this._selectTokenFromSearch(targetToken);
    }

    LoggingService.success("Target token found...");
    LoggingService.success("Tokens are all set");
    return await Promise.resolve(true);
  }

  async _checkTokenPair() {
    LoggingService.processing("Checking token pair setting...")
    const page = this.#page;
    const sourceToken = this.#tokenPair.source.name;
    const targetToken = this.#tokenPair.target.name;

    const _selectors = this.#selectors.exchangeForm;
    const _pptrService = this.#pptrService;

    LoggingService.processing("Waiting for tokens...")
    await page.waitForSelector(_selectors.sourceTokenSymbol);
    await page.waitForSelector(_selectors.targetTokenSymbol);

    LoggingService.processing("Evaluating token selection...")
    const _sourceTokenText = await _pptrService
    .getInnerHTML(
      page,
      _selectors.sourceTokenSymbol
    );

    const _targetTokenText = await _pptrService
    .getInnerHTML(
      page,
      _selectors.targetTokenSymbol
    );

    return await Promise.resolve(
      sourceToken == _sourceTokenText &&
      targetToken == _targetTokenText
    );
  }

  async _selectTokenFromSearch(token) {
    try {
      LoggingService.processing(`Searching for '${token}' token...`);
      const page = this.#page;
      const _selectors = this.#selectors.tokenSearch;
      const _pptrService = this.#pptrService;

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
        LoggingService.errorMessage("Please check your setting and try again");
        throw new Error(_message);
      }

      LoggingService.processing('Checking if token can be selected...');
      const _isTokenDisabled = await _pptrService
      .isElementDisabled(
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
      LoggingService.error("Please check chain config and try again");
      LoggingService.errorMessage(e);
      throw new Error(_message);
    }
  }
}