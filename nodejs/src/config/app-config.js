"use strict";
exports.__esModule = true;
exports.AppConfig = void 0;
var AppConfig = /** @class */ (function () {
    function AppConfig() {
    }
    AppConfig.env = function () {
        var _extensionFolder = AppConfig._extension.folder;
        return {
            browserExtensionUrl: 'chrome-extension://' + _extensionFolder + '/home.html#unlock',
            browserExtension: AppConfig._paths.extension + '/' + _extensionFolder + '/' + AppConfig._extension.version,
            userProfileData: AppConfig._paths.profileData
        };
    };
    AppConfig._extension = {
        version: '9.8.4_0',
        folder: 'nkbihfbeogaeaoehlefnkodbefgpgknn'
    };
    AppConfig._paths = {
        extension: '%LocalAppData%/Google/Chrome/User Data/Default/Extensions',
        profileData: '%LocalAppData%/Chromium/User Data/Profile 1'
    };
    return AppConfig;
}());
exports.AppConfig = AppConfig;
