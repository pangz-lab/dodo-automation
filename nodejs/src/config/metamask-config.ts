import { AppConfig } from "./app-config";
import { UserCredentials } from "../../lib/model/wallet-interface";

export class MetaMaskConfig {

  private readonly _browser = {
    selector: {
      passwordField: '#password',
      loginButton: '#app-content > div > div.main-container-wrapper > div > div > button > span',
    }
  }

  selector(): any {
    return this._browser.selector;
  }

  userAccount(): UserCredentials {
    return {
      username: '',
      password: this._getPassword(),
    };
  }

  browserExtensionPath(): string {
    return AppConfig.env().browserExtension;
  }

  browserExtensionUrl(): string {
    return AppConfig.env().browserExtensionUrl;
  }
  
  userProfileDataPath(): string {
    return AppConfig.env().userProfileData;
  }

  private _getPassword(): string {
    return 'M@skuM3t@';
  }
}