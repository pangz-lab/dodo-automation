import { WalletInterface } from "../../../lib/model/wallet-interface.js";

export class MetaMaskWallet extends WalletInterface {
  #config;

  constructor(config) {
    super();
    this.#config = config;
  }

  browserSetting() {
    return this.#config.browserSetting();
  }

  userAccount() {
    return this.#config.userAccount();
  }

  isUnlocked(page) {
    const _url = page.url();
    return !(_url.slice(-4) == 'unlock');
  }
}