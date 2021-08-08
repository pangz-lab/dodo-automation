class AppConfig {
  static #extension = {
    version: '9.8.4_0',
    folder: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
  };
  static #paths = {
    extension: '%LocalAppData%/Google/Chrome/User Data/Default/Extensions',
    profileData: '%LocalAppData%/Chromium/User Data/Profile 1',
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