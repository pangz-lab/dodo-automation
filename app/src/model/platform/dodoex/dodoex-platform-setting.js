import { PlatformSettingInterface } from "../../../../lib/model/platform-setting-interface.js";
import { AppConfig } from "../../../config/app-config.js";

export class DodoExPlatformSetting extends PlatformSettingInterface {
  wallet;
  #setting;
  #url;
  #exchangeUrl;
  #poolManagementUrl;
  #tokenNetwork;
  #endpoints;
  
  constructor(wallet) {
    super();
    this.wallet = wallet;
    this.#setting = AppConfig.app().platform.dodoex;
    this.#url = this.#setting.webUrl;
    this.#endpoints = this.#setting.endpoints;
    this.#exchangeUrl = this.#url+'/'+this.#endpoints.exchange;
    this.#poolManagementUrl = this.#url+'/'+this.#endpoints.poolList+"/";
    this.#tokenNetwork = this.#setting.network;
  }

  tokenExchangeURL(sourceToken, targetToken) {
    const _urlSuffix = sourceToken+'-'+targetToken+"?network="+this.#tokenNetwork;
    return this.#exchangeUrl+_urlSuffix;
  }

  poolRebalanceURL(poolAddress) {
    const _urlSuffix = poolAddress+"?network="+this.#tokenNetwork;
    return this.#poolManagementUrl+_urlSuffix;
  }
  
  exchangeSelectors() {
    return this.#setting
    .exchange
    .selectors;
  }

  poolRebalanceSelectors() {
    return this.#setting
    .pool
    .selectors;
  }

  postApprovalOperationSelectors() {
    return this.#setting
    .postApprovalOperation
    .selectors;
  }

  chain() {
    return AppConfig.chain();
  }

  generalSetting() {
    return AppConfig.app().general;
  }
}