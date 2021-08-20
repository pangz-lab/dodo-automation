import { AppConfig } from "../../config/app-config.js";

export class MetaMaskWalletSetting {
  #config;

  constructor() {
    this.#config = AppConfig.app().browser.extension.wallet.metamask;
  }

  _config() {
    return this.#config;
  }

  selectors() {
    return AppConfig.app().platform.metamask.selectors;
  }

  chainTokenSymbol() {
    return this._config().app.chainTokenSymbol;
  }

  browserSetting() {
    const _app = this.#config.app;
    const _appSetting = this.#config.appSetting;
    const _extLocalPath = _appSetting.localPath+_appSetting.version;
    return {
      extension: {
        path: _extLocalPath,
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