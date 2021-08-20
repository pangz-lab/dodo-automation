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

  const s1 = await platform.createServer('tokenExchange', "500G:500DC");
  const s2 = await platform.createServer('tokenExchange', "500DC:500G");
  const s3 = await platform.createServer('poolRebalance', "500G:500DC");

  // await platform.useServer(s1).exchangeToken();
  // await platform.useServer(s3).rebalancePool();
  let counter = 1;
  while(counter <= 2) {
    await platform.useServer(s1).exchangeToken();
    await platform.useServer(s3).rebalancePool();
    await platform.useServer(s2).exchangeToken();
    counter++;
  }


  // await platform.exchangeToken("500G:500DC");
  // await platform.rebalancePool("500G:500DC");
  // await platform.exchangeToken("500DC:500G");
  // await platform.rebalancePool("500G:500DC");
})();
