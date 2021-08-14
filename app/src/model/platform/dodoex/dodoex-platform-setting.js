import { PlatformSettingInterface } from "../../../../lib/model/platform-setting-interface.js";
import { AppConfig } from "../../../config/app-config.js";

export class DodoExPlatformSetting extends PlatformSettingInterface {
  wallet;
  #setting;
  #url;
  #exchangeUrl;
  #tokenNetwork;
  #endpoints;
  
  constructor(wallet) {
    super();
    this.wallet = wallet;
    this.#setting = AppConfig.platform().dodoex;
    this.#url = this.#setting.webUrl;
    this.#endpoints = this.#setting.endpoints;
    this.#exchangeUrl = this.#url+'/'+this.#endpoints.exchange;
    this.#tokenNetwork = this.#setting.network;
  }

  tokenExchangeURL(sourceToken, targetToken) {
    const _urlSuffix = sourceToken+'-'+targetToken+"?network="+this.#tokenNetwork;
    return this.#exchangeUrl+_urlSuffix;
  }

  exchangeSelectors() {
    return this.#setting
    .exchange
    .selectors;
  }
}