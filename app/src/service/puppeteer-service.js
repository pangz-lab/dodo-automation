export class PuppeteerService {

  async findTabWithUrl(browser, tabUrl) {
    const browserContext = browser.defaultBrowserContext();
    return await browserContext.waitForTarget(target => target.url() === tabUrl);
  }
  
  async getElementProperty(page, element, elementCallback) {
    const elementReference = await page.$(element);
    return await page.evaluate(elementCallback, elementReference);
  }

  async resetInput(page, element) {
    await page.waitForSelector(element);
    return await page.evaluate( () => document.execCommand( 'selectall', false, null ) );
  }

  async isElementDisabled(page, elementSelector) {
    return await this.getElementProperty(
      page,
      elementSelector,
      el => el.disabled
    );
  }

  async getInnerHTML(page, elementSelector) {
    return await this.getElementProperty(
      page,
      elementSelector,
      el => el.innerHTML
    );
  }

  async isElementDisabledWithRetry(page, selector, allowedRetry) {
    const _allowedRetry = allowedRetry;
    let _retryCount = 1;
    let _isDisabled = true;
    while(_isDisabled && _retryCount <= _allowedRetry) {
      _isDisabled = await this.isElementDisabled(page, selector);
      await page.waitForTimeout(1000);
      _retryCount++;
    }

    return _isDisabled;
  }
}