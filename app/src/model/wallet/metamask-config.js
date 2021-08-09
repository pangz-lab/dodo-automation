import { AppConfig } from "../../config/app-config.js";

export class MetaMaskConfig {
  chainTokenSymbol() {
    return 'BNB';
  }

  browserSetting() {
    return {
      extension: {
        path: AppConfig.env().browserExtension,
        url: AppConfig.env().browserExtensionUrl,
      },
      userProfile: {
        dataPath: AppConfig.env().userProfileData,
      },
      selector: {
        passwordField: '#password',
        loginButton: '#app-content > div > div.main-container-wrapper > div > div > button > span',
        binanceTokenSymbol: '#app-content > div > div.main-container-wrapper > div > div > div > div.home__balance-wrapper > div > div.wallet-overview__balance > div > div > div > div > div > span.currency-display-component__suffix',
      },
    };
  }

  userAccount() {
    return {
      username: '',
      password: this._getPassword(),
    };
  }

  _getPassword() {
    // return 'M@skuM3t@';
    return 'M@skuM3t@fdfd';
  }
}