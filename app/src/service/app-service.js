import pkg from "puppeteer";
import { PuppeteerService } from './puppeteer-service.js';

export class AppService {
  puppeteer = pkg;
  puppeteerService = new PuppeteerService();
};