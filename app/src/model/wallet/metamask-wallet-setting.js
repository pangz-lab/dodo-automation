import { AppConfig } from "../../config/app-config.js";

export class MetaMaskWalletSetting {
  #config;

  constructor() {
    this.#config = AppConfig.app().browser.extension.wallet.metamask;
  }

  _config() {
    return this.#config;
  }

  chainTokenSymbol() {
    return this._config().app.chainTokenSymbol;
  }

  browserSetting() {
    // return {
    //   browserExtensionUrl: _walletAppSetting.browserUrl,
    //   browserExtension: _walletAppSetting.localPath,
    //   userProfileData: _walletAppSetting.userProfileDataPath,
    // };\
    const _app = this.#config.app;
    const _appSetting = this.#config.appSetting;
    return {
      extension: {
        path: _appSetting.localPath,
        url: _appSetting.browserUrl,
      },
      userProfile: {
        dataPath: _appSetting.userProfileDataPath,
      },
      selector: _app.selector,
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
    // return 'M@skuM3t@fdfd';
  }
}