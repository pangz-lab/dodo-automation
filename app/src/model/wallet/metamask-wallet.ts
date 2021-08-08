import { BrowserSetting, UserCredentials, WalletInterface } from "../../../lib/model/wallet-interface";
import { MetaMaskConfig } from "./metamask-config";

export class MetaMaskWallet implements WalletInterface {
  _config: MetaMaskConfig;

  constructor(config: MetaMaskConfig) {
    this._config = config;
  }

  browserSetting(): BrowserSetting {
    return {
      extension: {
        path: this._config.browserExtensionPath(),
        url: this._config.browserExtensionUrl(),
      },
      userProfile: {
        dataPath: this._config.userProfileDataPath()
      },
      selector: this._config.selector(),
    };
  }

  userAccount(): UserCredentials {
    return this._config.userAccount();
  }
}