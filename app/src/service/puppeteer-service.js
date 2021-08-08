export class PuppeteerService {
  
  async findTabWithUrl(browser, tabUrl) {
    const browserContext = browser.defaultBrowserContext();
    return await browserContext.waitForTarget(target => target.url() === tabUrl);
  }
}