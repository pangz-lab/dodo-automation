import { DodoExPlatform } from "./src/model/platform/dodoex/dodoex-platform.js";
import { DodoExPlatformSetting } from  "./src/model/platform/dodoex/dodoex-platform-setting.js";
import { MetaMaskWallet } from  "./src/model/wallet/metamask-wallet.js";
import { MetaMaskWalletSetting } from  "./src/model/wallet/metamask-wallet-setting.js";

let platformSetting = new DodoExPlatformSetting(
  new MetaMaskWallet(
    new MetaMaskWalletSetting()
  )
);

let platform = new DodoExPlatform(platformSetting);

(async () => {
  await platform.setup();
  await platform.connectToWallet();
  // await platform.swapToken("500G:500DC");
  // await platform.swapToken("500DC:500G");
  // await platform.swapTokenUntil("500G:500DC", 5);
  // await platform.swapTokenUntil("500DC:500G", 5);
  // await platform.swapTokenUntil("500G:500DC", 2);
  // await platform.swapTokenInfinite("500DC:500G");
  // await platform.swapTokenInfinite("500G:500DC");
  // await platform.swapTokenTest("500DC:500G");
  await platform.exchangeToken("500G:500DC");
  // await platform.rebalancePool("500G:500DC");
})();
