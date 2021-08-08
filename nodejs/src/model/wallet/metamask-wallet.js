"use strict";
exports.__esModule = true;
exports.MetaMaskWallet = void 0;
var MetaMaskWallet = /** @class */ (function () {
    function MetaMaskWallet(config) {
        this._config = config;
    }
    MetaMaskWallet.prototype.browserSetting = function () {
        return {
            extension: {
                path: this._config.browserExtensionPath(),
                url: this._config.browserExtensionUrl()
            },
            userProfile: {
                dataPath: this._config.userProfileDataPath()
            },
            selector: this._config.selector()
        };
    };
    MetaMaskWallet.prototype.userAccount = function () {
        return this._config.userAccount();
    };
    return MetaMaskWallet;
}());
exports.MetaMaskWallet = MetaMaskWallet;
