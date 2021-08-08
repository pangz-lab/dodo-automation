import { DodoExPlatform } from "./src/model/platform/dodoex/dodoex-platform";
import { DodoExPlatformSetting } from "./src/model/platform/dodoex/dodoex-platform-setting";
import { MetaMaskConfig } from "./src/config/metamask-config";
import { MetaMaskWallet } from "./src/model/wallet/metamask-wallet";
import { AppService } from "./src/service/app-service";


const platformSetting = new DodoExPlatformSetting(
  new MetaMaskWallet(
    new MetaMaskConfig()
  )
);

const platform = new DodoExPlatform(
  platformSetting,
  new AppService()
);

platform.setup();