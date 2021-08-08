"use strict";
exports.__esModule = true;
exports.MetaMaskConfig = void 0;
var app_config_1 = require("./app-config");
var MetaMaskConfig = /** @class */ (function () {
    function MetaMaskConfig() {
        this._browser = {
            selector: {
                passwordField: '#password',
                loginButton: '#app-content > div > div.main-container-wrapper > div > div > button > span'
            }
        };
    }
    MetaMaskConfig.prototype.selector = function () {
        return this._browser.selector;
    };
    MetaMaskConfig.prototype.userAccount = function () {
        return {
            username: '',
            password: this._getPassword()
        };
    };
    MetaMaskConfig.prototype.browserExtensionPath = function () {
        return app_config_1.AppConfig.env().browserExtension;
    };
    MetaMaskConfig.prototype.browserExtensionUrl = function () {
        return app_config_1.AppConfig.env().browserExtensionUrl;
    };
    MetaMaskConfig.prototype.userProfileDataPath = function () {
        return app_config_1.AppConfig.env().userProfileData;
    };
    MetaMaskConfig.prototype._getPassword = function () {
        return 'M@skuM3t@';
    };
    return MetaMaskConfig;
}());
exports.MetaMaskConfig = MetaMaskConfig;
