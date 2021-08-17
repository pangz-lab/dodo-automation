import { LoggingService } from "../../../service/logging-service.js";

export class DodoExPoolRebalance {
  #setting;
  #service;
  #pptrService;
  #selectors;

  constructor(setting, service) {
    this.#setting = setting;
    this.#service = service;
    this.#pptrService = service.puppeteerService;
    this.#selectors = this.#setting.poolListSelectors();
  }

  async executeRebalance(page, pool) {
    const _selectors = this.#selectors;
    const _pptrService = this.#pptrService;
    await page.waitForSelector(_selectors.modifyParametersButton);

    const _allowedRetry = 10;
    const _isDisabled = await _pptrService.isElementDisabledWithRetry(
      page,
      _selectors.modifyParametersButton,
      _allowedRetry
    );

    if(_isDisabled) {
      const _message = "Pool parameters cannot be updated";
      LoggingService.error(_message);
      LoggingService.errorMessag("Failed to initialize rebalance page");
      throw new Error(_message);
    }

    LoggingService.processing("Initializing rebalance maintenance page...");
    await page.click(_selectors.modifyParametersButton);
    await this._acceptDisclaimerAgreement(page);
    
    await this._setTokenAmount(page, pool);
    
  }

  async _acceptDisclaimerAgreement(page) {
    const _selectors = this.#selectors;
    LoggingService.processing("Accepting disclaimer agreement...");
    
    try {
      await page.waitForSelector(
        _selectors.discalimer.agreeCheckbox,
        {timeout: 2000}
      );
    } catch (e) {
      LoggingService.processing("No disclaimer agreement posted...");
      LoggingService.success("Proceeding with the operation...");
      return await Promise.resolve(true);
    }

    await page.waitForTimeout(1000);
    await page.click(_selectors.discalimer.agreeCheckbox);
    await page.waitForTimeout(1000);
    await page.click(_selectors.discalimer.continueButton);
    LoggingService.success("Disclaimer agreement accepted...");
  }

  async _setTokenAmount(page, pool) {
    LoggingService.processing("Setting token amount...");
    const _selectors = this.#selectors.rebalanceForm;
    const _sourceTokenAmount = pool.source.value.toString();
    const _targetTokenAmount = pool.target.value.toString();
    await page.waitForSelector(_selectors.sourceTokenInputField);
    await page.waitForSelector(_selectors.targetTokenInputField);

    console.log(_sourceTokenAmount);
    console.log(_targetTokenAmount);
    LoggingService.processing("Setting source token amount...");
    await this.#pptrService.clearInput(page, _selectors.sourceTokenInputField);
    await page.type(_selectors.sourceTokenInputField, _sourceTokenAmount, {delay: 100});
    
    LoggingService.processing("Setting target token amount...");
    await this.#pptrService.clearInput(page, _selectors.targetTokenInputField);
    await page.type(_selectors.targetTokenInputField, _targetTokenAmount, {delay: 100});
  }
}