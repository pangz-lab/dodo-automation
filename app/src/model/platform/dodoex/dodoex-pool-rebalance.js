import { LoggingService } from "../../../service/logging-service.js";

export class DodoExPoolRebalance {
  #setting;
  #service;
  #pptr;
  #selectors;

  constructor(setting, service) {
    this.#setting = setting;
    this.#service = service;
    this.#pptr = service.puppeteerService;
    this.#selectors = this.#setting.poolListSelectors();
  }

  async _executeRebalance(page) {
    const _selectors = this.#selectors;
    await page.waitForSelector(_selectors.modifyParametersButton);
    await page.click(_selectors.modifyParametersButton);

    // await page.waitForSelector(_selectors.discalimer.agreeCheckbox);
    // await page.waitForSelector(_selectors.discalimer.continueButton);
    
    // await page.click(_selectors.discalimer.continueButton);
  }
}