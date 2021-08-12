import pptr from "puppeteer";
import { PuppeteerService } from './puppeteer-service.js';

export class AppService {
  puppeteer = pptr;
  puppeteerService = new PuppeteerService();
};