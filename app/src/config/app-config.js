import fs from "fs";

export class AppConfig {
  static _configFileData = {};
  static _paths = {app: '.config/app.config.json', chain: '.config/chain.config.json'};
  static LOGIN_RETRY = 3;

  static #appConfig = AppConfig._getConfig("app");
  static #chainConfig = AppConfig._getConfig("chain");
  // static #browserExtension = AppConfig.#appConfig.browser.extension;
  // static #walletSetting = AppConfig.#browserExtension.wallet.metamask;
  static #platformSetting = AppConfig.#appConfig.platform;
  // static #extension = {
  //   version: '9.8.4_0',
  //   folder: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
  // };
  // static #appDataPath = process.env.LOCALAPPDATA;
  // static #paths = {
  //   extension: this.#appDataPath+'/Google/Chrome/User Data/Default/Extensions',
  //   profileData: this.#appDataPath+'/Chromium/User Data/Profile 1',
  // };

  // static env() {
  //   const _walletAppSetting = AppConfig.#walletSetting.appSetting;

  //   return {
  //     browserExtensionUrl: _walletAppSetting.browserUrl,
  //     browserExtension: _walletAppSetting.localPath,
  //     userProfileData: _walletAppSetting.userProfileDataPath,
  //   };
  // }

  static _getConfig(config) {
    if(AppConfig._configFileData[config] == undefined) {
      const _data = fs.readFileSync(AppConfig._paths[config]);
      AppConfig._configFileData[config] = JSON.parse(_data);
    }
    return AppConfig._configFileData[config];
  }

  static app() {
    return AppConfig.#appConfig;
  }

  static platform() {
    return AppConfig.#platformSetting;
  }

  static chain() {
    return AppConfig.#chainConfig;
  }
}