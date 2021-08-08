import { PuppeteerService } from "./puppeteer-service";

const puppeteer = require('puppeteer');

export class AppService {
  readonly puppeteer = puppeteer;
};