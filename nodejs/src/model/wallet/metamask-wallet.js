import { BrowserSetting, UserCredentials, WalletInterface } from "../../../lib/model/wallet-interface.js";
import { MetaMaskConfig } from "./metamask-config.js";

export class MetaMaskWallet extends WalletInterface {
  #config;

  constructor(config) {
    this.#config = config;
  }

  browserSetting() {
    return this.#config.browserSetting();
  }

  userAccount() {
    return this.#config.userAccount();
  }
}