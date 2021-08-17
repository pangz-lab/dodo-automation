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

  async _executeRebalance(page) {
    const _selectors = this.#selectors;
    const _pptrService = this.#pptrService;
    await page.waitForSelector(_selectors.modifyParametersButton);

    const _allowedRetry = 10;
    // let _isDisabled = true;

    // while(_isDisabled && _retryCount <= _allowedRetry) {
    //   _isDisabled = await _pptrService.isElementDisabled(
    //     page,
    //     _selectors.modifyParametersButton
    //   );
    //   await page.waitForTimeout(1000);
    //   _retryCount++;
    // }

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
    
  }

  async _acceptDisclaimerAgreement(page) {
    const _selectors = this.#selectors;
    LoggingService.processing("Accepting disclaimer agreement...");
    
    const _agreeButton = await page.waitForSelector(
      _selectors.discalimer.agreeCheckbox
    );

    if(_agreeButton == null) {
      return Promise.resolve(true);
    }

    await page.waitForTimeout(1000);
    await page.click(_selectors.discalimer.agreeCheckbox);
    await page.waitForTimeout(1000);
    await page.click(_selectors.discalimer.continueButton);
  }

  async _setTokenAmount(page, token) {
    const _selectors = this.#selectors;

  }
}