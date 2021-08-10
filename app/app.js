import { DodoExPlatform } from "./src/model/platform/dodoex/dodoex-platform.js";
import { DodoExPlatformSetting } from  "./src/model/platform/dodoex/dodoex-platform-setting.js";
import { MetaMaskWallet } from  "./src/model/wallet/metamask-wallet.js";
import { MetaMaskConfig } from  "./src/model/wallet/metamask-config.js";

let platformSetting = new DodoExPlatformSetting(
  new MetaMaskWallet(
    new MetaMaskConfig()
  )
);

let platform = new DodoExPlatform(platformSetting);

(async () => {
  await platform.setup();
  await platform.connectToWallet();
  // await platform.swapToken("500DC", "500G");
  await platform.swapToken("500G", "500DC");
  // await platform.swapToken("1INCH", "WBNB");
  // await platform.swapToken("1INCH", "WBNQWB");
})();
