import { PlatformSettingInterface } from "../../../../lib/model/platform-setting-interface.js";

export class DodoExPlatformSetting extends PlatformSettingInterface {
  wallet;
  
  constructor(wallet) {
    super();
    this.wallet = wallet;
  }
}