import { DodoExPlatform } from "../lib/domain/platform/dodoex/dodoex-platform.js";
import { DodoExPlatformSetting } from  "../lib/domain/platform/dodoex/dodoex-platform-setting.js";
import { MetaMaskWallet } from  "../lib/model/wallet/metamask-wallet.js";
import { MetaMaskWalletSetting } from  "../lib/model/wallet/metamask-wallet-setting.js";

export class CliRunner {
  #platform;
  features = {
    "walletConnection" : "wallet-connection",
    "tokenExchange" : "token-exchange",
    "poolRebalance" : "pool-reblance ",
  };
  #messages = {
    "walletSetup": `[ Please setup your wallet information ]\n
  ✔️ If this is your first time opening this page, you might need to import your keys or account.
  ✔️ Make sure to setup the chain network and tokens correctly.
  ✔️ Keep your password in a safe place.
  
  ⚠️ If the wallet is compromised, delete the user data or reinstall the extension then rerun this setup.`
  };

  constructor(platform) {
    this.#platform = platform;
  }

  _platformObj() {
    return this.#platform;
  }

  async setup(param, options) {
    const f = param.feature;
    switch(f) {
      case this.features.walletConnection:
        const p = this._platformObj();
        const message = this.#messages.walletSetup;
        await p.setup();
        const page = await p.openWallet();
        await p.showMessage(page, message);
      break;
      default: console.log(` >> Unknown value for feature: ${f}`);
    }
  }

  dryRun() {

  }
  run() {

  }
}