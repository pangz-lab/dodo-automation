import { PlatformSettingInterface } from "../../../../lib/model/platform-setting-interface";
import { WalletInterface } from "../../../../lib/model/wallet-interface";

export class DodoExPlatformSetting implements PlatformSettingInterface {
  readonly wallet: WalletInterface;
  
  constructor(wallet: WalletInterface) {
    this.wallet = wallet;
  }
}