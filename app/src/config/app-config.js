export class AppConfig {
  static LOGIN_RETRY = 3;

  static #extension = {
    version: '9.8.4_0',
    folder: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
  };
  static #appDataPath = process.env.LOCALAPPDATA;
  static #paths = {
    extension: this.#appDataPath+'/Google/Chrome/User Data/Default/Extensions',
    profileData: this.#appDataPath+'/Chromium/User Data/Profile 1',
  };

  static env() {
    const _extensionFolder = AppConfig.#extension.folder;
    return {
      browserExtensionUrl: 'chrome-extension://'+_extensionFolder+'/home.html#unlock',
      browserExtension: AppConfig.#paths.extension+'/'+_extensionFolder+'/'+AppConfig.#extension.version,
      userProfileData: AppConfig.#paths.profileData,
    };
  }

  static platform() {
    return {
      dodoex: {
        webUrl: 'https://app.dodoex.io',
        webExchangeUrl: 'https://app.dodoex.io/exchange/',
        selectors: {
          exchange: {
            sourceTokenSymbol: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(3) > div > div > div.TokenDisp__Name-dodo__onyo6i-1.gfuMgU',
            targetTokenSymbol: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(6) > div > div > div.TokenDisp__Name-dodo__onyo6i-1.gfuMgU',
            input: {
              sourceToken: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(3) > input',
            },
            button: {
              preExchange: '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > button',
              confirmExchange: '#app-content > div > div.main-container-wrapper > div > div.confirm-page-container-content > div.page-container__footer > footer > button.button.btn-primary.page-container__footer-button',
              afterExchange: '#entry > div.Dialog__DialogBackdrop-dodo__olf3aw-0.ccRRLn.dialog-backdrop.fade-enter-done > div > div.Dialog__DialogBody-dodo__olf3aw-6.bLVQPQ.dialog-body > button',
            }
          }
// const DODO_FROM_TOKEN = '#entry > div.MainPage_MainPage__1GwE3 > div > div.right > div > div > div.indexstyled__CardWrapperVertical-dodo__sc-9junse-5.iPoimT > div.indexstyled__Card-dodo__sc-9junse-6.cIITjA > div > div > div > div:nth-child(3) > input';

        }
      }
    };
  }
}