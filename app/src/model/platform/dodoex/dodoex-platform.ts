import { Browser } from "puppeteer";
import { DodoExPlatformSetting } from "./dodoex-platform-setting";
import { BlockchainPlatformInterface } from "../../../../lib/model/blockchain-platform-interface";
import { BlockchainPlatform } from "../../blockchain-platform";
import { PuppeteerService } from "../../../service/puppeteer-service";
import { AppService } from "../../../service/app-service";
import { LoggingService } from "../../../service/logging-service";

export class DodoExPlatform 
  extends BlockchainPlatform 
  implements BlockchainPlatformInterface {

  readonly _setting: DodoExPlatformSetting;
  private _browser: any;
  private _appService: AppService;

  constructor(setting: DodoExPlatformSetting, appService: AppService) {
    super(setting);
    this._setting = setting;
    this._appService = appService.puppeteer;
  }

  setup(): boolean {
    try {
      (async () => {
        const setting = this._setting;
        const puppeteer = this._appService.puppeteer;

        const extensionPath = setting.wallet.browserSetting().extension.path;
        const profileDataPath = setting.wallet.browserSetting().userProfile.dataPath;
        const browser = await puppeteer.launch({
          headless: false,
          defaultViewport: null,
          args: [
            `--start-maximized`,
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            `--user-data-dir=${profileDataPath}`
          ],
        });

        console.log(browser);
        
        this._browser = browser;
      });

      return true;

    } catch (e) {
      const _log = '[error]: Failed platform login';
      LoggingService.text(e+' > '+_log);
      throw new Error(_log);
    }
  }

  connectToWallet(): boolean {

    (async () => {
      const metaMaskTab = await PuppeteerService.findTabWithUrl(
        this._browser,
        this._setting.wallet.browserSetting().extension.url
      );

      const page = await metaMaskTab.page();
      await page?.bringToFront();

      const loginSuccessful = this._login(page);
      if(!loginSuccessful) {await this._browser.close();}
    
      await page?.close();
    });

    return true;
  
  }

  swapToken(sourceToken: String, destinationToken: String): boolean { return true;}
  rebalancePool(sourceToken: String, destinationToken: String): boolean { return true;}

  private _login(page: any): boolean {

    (async () => {
      const password = this._setting.wallet.userAccount().password;
      const selector = this._setting.wallet.browserSetting().selector;
  
      await page.type(selector.passwordField, password, {delay: 100});
      await page.click(selector.loginButton , {delay: 3000});
    });

    return true;
  }
}