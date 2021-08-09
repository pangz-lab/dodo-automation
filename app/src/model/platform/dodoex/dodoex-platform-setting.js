import { PlatformSettingInterface } from "../../../../lib/model/platform-setting-interface.js";
import { AppConfig } from "../../../config/app-config.js";

export class DodoExPlatformSetting extends PlatformSettingInterface {
  wallet;
  platformSetting;
  
  constructor(wallet) {
    super();
    this.wallet = wallet;
    this.platformSetting = AppConfig.platform().dodoex;
  }

  tokenExchangeURL(sourceToken, targetToken) {
    const urlSuffix = sourceToken+'-'+targetToken+'?network=bsc-mainnet';
    return this.platformSetting
      .webExchangeUrl+urlSuffix;
  }

  exchangeSelectors() {
    return this.platformSetting
    .selectors
    .exchange;
  }
}