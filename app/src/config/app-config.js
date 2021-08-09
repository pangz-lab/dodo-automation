class AppConfig {
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
}

export { AppConfig };