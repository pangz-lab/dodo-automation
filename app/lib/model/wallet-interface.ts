export type UserCredentials = {
  username: string,
  password: string,
}

export type ExtensionSetting = {
  path: string,
  url: string,
}

export type UserProfileSetting = {
  dataPath: string,
}

export type BrowserSetting = {
  extension: ExtensionSetting,
  userProfile: UserProfileSetting,
  selector: any;
};

export interface WalletInterface {
  browserSetting(): BrowserSetting;
  userAccount(): UserCredentials;
}