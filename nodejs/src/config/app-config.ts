type AppEnvironment = {
  browserExtensionUrl: string;
  browserExtension: string;
  userProfileData: string;
}

export class AppConfig {
  static readonly _extension = {
    version: '9.8.4_0',
    folder: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
  };
  static readonly _paths = {
    extension: '%LocalAppData%/Google/Chrome/User Data/Default/Extensions',
    profileData: '%LocalAppData%/Chromium/User Data/Profile 1',
  };

  static env(): AppEnvironment {
    const _extensionFolder = AppConfig._extension.folder;
    return {
      browserExtensionUrl: 'chrome-extension://'+_extensionFolder+'/home.html#unlock',
      browserExtension: AppConfig._paths.extension+'/'+_extensionFolder+'/'+AppConfig._extension.version,
      userProfileData: AppConfig._paths.profileData,
    };
  }
}