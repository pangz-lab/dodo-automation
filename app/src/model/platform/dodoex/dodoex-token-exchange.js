import { LoggingService } from "../../../service/logging-service.js";

export class DodoExTokenExchange {
  #setting;
  #service;
  #puppeteerService;
  #selectors;

  constructor(setting, service) {
    this.#setting = setting;
    this.#service = service;
    this.#puppeteerService = service.puppeteerService;
    this.#selectors = this.#setting.exchangeSelectors();
  }

  async setupTokenPair(page, sourceToken, targetToken) {
    LoggingService.starting("Setting up token pair...");
    const _selectors = this.#selectors;
    const _service = this.#puppeteerService;

    LoggingService.processing("Waiting for tokens...");
    await page.waitForSelector(_selectors.sourceTokenSymbol);
    await page.waitForSelector(_selectors.targetTokenSymbol);

    LoggingService.processing("Selecting the correct token...");
    LoggingService.processing("Selecting source token...");
    await page.click(_selectors.sourceTokenSymbol);
    await page.type(_selectors.tokenSearch.searchField, sourceToken, {delay: 100});
    await page.click(_selectors.tokenSearch.firstResultText);
    
    LoggingService.processing("Selecting target token...");
    await page.click(_selectors.targetTokenSymbol);
    await page.type(_selectors.tokenSearch.searchField, targetToken, {delay: 100});
    await page.click(_selectors.tokenSearch.firstResultText);
    
    LoggingService.success("Tokens are all set");
    return await Promise.resolve(true);
  }

  async checkTokenPair(page, sourceToken, targetToken) {
    LoggingService.starting("Checking token pair...")
    const _selectors = this.#selectors;
    const _service = this.#puppeteerService;

    LoggingService.processing("Waiting for tokens...")
    await page.waitForSelector(_selectors.sourceTokenSymbol);
    await page.waitForSelector(_selectors.targetTokenSymbol);

    LoggingService.processing("Evaluating token selection...")
    const _sourceTokenText = await _service.getElementProperty(
      page,
      _selectors.sourceTokenSymbol,
      el => el.innerHTML
    );
    const _targetTokenText = await _service.getElementProperty(
      page,
      _selectors.targetTokenSymbol,
      el => el.innerHTML
    );

    return await Promise.resolve(
      sourceToken == _sourceTokenText &&
      targetToken == _targetTokenText
    );
  }

  async prepare(page, sourceTokenValue) {
    LoggingService.starting("Preparing exchange...");
    const _tokenValue = sourceTokenValue.toString();
    const _service = this.#puppeteerService;
    const _selectors = this.#selectors;
    const _preExchangeButton = _selectors.button.preExchange;

    LoggingService.processing("Settting token value...");
    await page.type(_selectors.input.sourceToken, _tokenValue, {delay: 100});
    await page.waitForSelector(_preExchangeButton);

    let _isButtonDisabled = true;
    while(_isButtonDisabled) {
      LoggingService.processing("Waiting to allow confirmation...");
      
      await page.waitForTimeout(2000);
      _isButtonDisabled = await _service.isElementDisabled(
        page,
        _preExchangeButton
      );
    }

    LoggingService.processing("Token is ready for swapping...");
    return await Promise.resolve(true);
  }
  
  async approve(browser, page) {
    try {
      const _popupConfirmPage = new Promise(
        x => browser.once(
          'targetcreated', target => x(target.page())
        )
      );
      const _selectors = this.#selectors;
      const _preExchangeButton = _selectors.button.preExchange;
      const _confirmExchangeButton = _selectors.button.confirmExchange;
      const _afterExchangeButton = _selectors.button.afterExchange;

      LoggingService.starting("Token approval starting...");
      await page.click(_preExchangeButton);

      LoggingService.processing("Confirming amount...");
      const _confirmPage = await _popupConfirmPage;
      await _confirmPage.waitForSelector(_confirmExchangeButton);

      LoggingService.processing("Processing exchange...");
      await _confirmPage.click(_confirmExchangeButton);

      LoggingService.processing("Exchange approved...");
      LoggingService.success("Approval successful...");
      await page.waitForSelector(_afterExchangeButton);
      await page.click(_afterExchangeButton);

      LoggingService.closing("Exchange completed...");

      return await Promise.resolve(true);

    } catch (e) {
      
      LoggingService.error("Token exchange approval error...");
      LoggingService.errorMessage(e);
      LoggingService.closing("Please check the input and setting then try again...");
      return await Promise.resolve(false);
    }
  }
}