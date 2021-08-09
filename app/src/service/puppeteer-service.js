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
    await page.evaluate( () => document.execCommand( 'selectall', false, null ) );
  }
}