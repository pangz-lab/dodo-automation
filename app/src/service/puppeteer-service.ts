const puppeteer = require('puppeteer');
import { Browser } from "puppeteer";

// export class PuppeteerService implements PuppeteerServiceInterface {
export class PuppeteerService {
  static async findTabWithUrl(browser: Browser, tabUrl: string) {
    const browserContext = browser.defaultBrowserContext();
    return await browserContext.waitForTarget(target => target.url() === tabUrl);
  }
}