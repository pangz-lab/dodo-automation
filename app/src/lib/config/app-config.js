import fs from "fs";

export class AppConfig {
  static _configFileData = {};
  static _paths = {
    app: '.config/app.config.json',
    chain: '.config/chain.config.json'
  };
  static LOGIN_RETRY = 3;

  static #appConfig = AppConfig._getConfig("app");
  static #chainConfig = AppConfig._getConfig("chain");

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

  static chain() {
    return AppConfig.#chainConfig;
  }
}