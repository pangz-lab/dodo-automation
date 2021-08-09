import { DodoExPlatform } from "./src/model/platform/dodoex/dodoex-platform.js";
import { DodoExPlatformSetting } from  "./src/model/platform/dodoex/dodoex-platform-setting.js";
import { MetaMaskWallet } from  "./src/model/wallet/metamask-wallet.js";
import { MetaMaskConfig } from  "./src/model/wallet/metamask-config.js";
import { AppService } from  "./src/service/app-service.js";

let platformSetting = new DodoExPlatformSetting(
  new MetaMaskWallet(
    new MetaMaskConfig()
  )
);

let platform = new DodoExPlatform(
  platformSetting, new AppService()
);

(async () => {
  await platform.setup();
  await platform.connectToWallet();
})();

// Promise.all([
//   platform.setup(),
//   platform.connectToWallet(),
// ]);
