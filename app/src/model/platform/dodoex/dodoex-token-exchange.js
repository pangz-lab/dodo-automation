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

  async checkPair(page, sourceToken, targetToken) {
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
    const tokenInputValue = sourceTokenValue.toString();
    const _service = this.#puppeteerService;
    const _selectors = this.#selectors;
    const _preExchangeButton = _selectors.button.preExchange;

    LoggingService.processing("Settting token value...");
    await page.type(_selectors.input.sourceToken, tokenInputValue, {delay: 100});
    await page.waitForSelector(_preExchangeButton);

    let isDisabled = true;
    while(isDisabled) {
      LoggingService.processing("Waiting to allow confirmation...");
      
      await page.waitForTimeout(2000);
      isDisabled = await _service.getElementProperty(
        page,
        _preExchangeButton,
        el => el.disabled
      );
    }
    LoggingService.processing("token preparation successful...");
    return await Promise.resolve(true);
  }
  
  async approve(browser, page) {
    try {
      const popupConfirmPage = new Promise(x => browser.once('targetcreated', target => x(target.page())));
      const _selectors = this.#selectors;
      const _preExchangeButton = _selectors.button.preExchange;
      const _confirmExchangeButton = _selectors.button.confirmExchange;
      const _afterExchangeButton = _selectors.button.afterExchange;

      LoggingService.starting("Token approval starting...");
      await page.click(_preExchangeButton);

      LoggingService.processing("Confirming amount...");
      const confirmPage = await popupConfirmPage;
      await confirmPage.waitForSelector(_confirmExchangeButton);

      LoggingService.processing("Processing exchange...");
      await confirmPage.click(_confirmExchangeButton);

      LoggingService.processing("Exchange approved...");
      LoggingService.success("Approval successful...");
      await page.waitForSelector(_afterExchangeButton);
      await page.click(_afterExchangeButton);

      LoggingService.closing("Exchange completed...");

      return await Promise.resolve(true);

    } catch (e) {
      
      LoggingService.error("Token exchange approval error...");
      LoggingService.errorMessage(e);
      LoggingService.closing("Please checkt the input and setting and try again...");
      return await Promise.resolve(false);
    }
  }
}