import { PlatformSettingInterface } from "../../../lib/model/platform-setting-interface";

export class BlockchainPlatform {
  _setting: PlatformSettingInterface;

  constructor(setting: PlatformSettingInterface) {
    this._setting = setting;
  }
}