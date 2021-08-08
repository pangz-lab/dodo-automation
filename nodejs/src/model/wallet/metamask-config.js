import { AppConfig } from "../../config/app-config.js";

class MetaMaskConfig {

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
      }
    };
  }

  userAccount() {
    return {
      username: '',
      password: this._getPassword(),
    };
  }

  _getPassword() {
    return 'M@skuM3t@';
  }
}