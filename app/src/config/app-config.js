import fs from "fs";

export class AppConfig {
  static _configFileData = {};
  static _paths = {app: '.config/app.config.json', chain: '.config/chain.config.json'};
  static LOGIN_RETRY = 3;

  static #appConfig = AppConfig._getConfig("app");
  static #chainConfig = AppConfig._getConfig("chain");
  static #browserExtension = AppConfig.#appConfig.browser.extension;
  static #walletSetting = AppConfig.#browserExtension.wallet.metamask;
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

  static env() {
    const _walletAppSetting = AppConfig.#walletSetting.appSetting;

    return {
      browserExtensionUrl: _walletAppSetting.browserUrl,
      browserExtension: _walletAppSetting.localPath,
      userProfileData: _walletAppSetting.userProfileDataPath,
    };
  }

  static _getConfig(config) {
    if(AppConfig._configFileData[config] == undefined) {
      const _data = fs.readFileSync(AppConfig._paths[config]);
      AppConfig._configFileData[config] = JSON.parse(_data);
    }
    return AppConfig._configFileData[config];
  }

  static platform() {
    return AppConfig.#platformSetting;
    // {
    //   dodoex: {
    //     webUrl: 'https://app.dodoex.io',
    //     webExchangeUrl: 'https://app.dodoex.io/exchange/',
    //     selectors: {
    //       exchange: {
    //         sourceTokenSymbol: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(3) > div > div > div.TokenDisp__Name-dodo__onyo6i-1.gfuMgU',
    //         targetTokenSymbol: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(6) > div > div > div.TokenDisp__Name-dodo__onyo6i-1.gfuMgU',
    //         input: {
    //           sourceToken: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(3) > input',
    //         },
    //         dropdownList: {
    //           sourceToken: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(3) > div > div > div.TokenDisp__Name-dodo__onyo6i-1.gfuMgU',
    //         },
    //         button: {
    //           preExchange: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > button',
    //           confirmExchange: '#app-content > div > div.main-container-wrapper > div > div.confirm-page-container-content > div.page-container__footer > footer > button.button.btn-primary.page-container__footer-button',
    //           afterExchange: '#entry > div.Dialog__DialogBackdrop-dodo__olf3aw-0.ccRRLn.dialog-backdrop.fade-enter-done > div > div.Dialog__DialogBody-dodo__olf3aw-6.bLVQPQ.dialog-body > button',
    //         },
    //         tokenSearch: {
    //           searchField: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div.TradeCard__Body-dodo__x2wmuu-2.fLjiUB > div.sc-jXcxbT.sc-fmdNqN.hNSlOo.hGtEoV > input',
    //           firstResultText: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div.TradeCard__Body-dodo__x2wmuu-2.fLjiUB > div:nth-child(2) > div > div > div.sc-dvUynV.bANDlC > div.right-wrapper > div.right-left > div.symbol > span:nth-child(1)',
    //           exitSearchButton: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div.TradeCard__Header-dodo__x2wmuu-0.cHJTJd > div > svg',
    //         }
    //       }
    //     }
    //   }
    // };
  }
}