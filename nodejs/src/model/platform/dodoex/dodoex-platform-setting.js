import { PlatformSettingInterface } from "../../../../lib/model/platform-setting-interface.js";

export default class DodoExPlatformSetting extends PlatformSettingInterface {
  wallet;
  
  constructor(wallet) {
    this.wallet = wallet;
  }
}