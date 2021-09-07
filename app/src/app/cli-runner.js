/**
 * Author: Pangz
 * Email: pangz.lab@gmail.com
 */
import readline from 'readline';
import util from 'util';
import fs from "fs";
import { LoggingService } from '../lib/service/logging-service.js';

export class CliRunner {
  #platform;
  #readlineQuestion;
  #defaultAccountFile = "account.json";
  features = {
    "browserSet" : "browser",
    "walletConnection" : "wallet",
    "tokenExchange" : "tokenex",
    "poolRebalance" : "poolreb",
    "multiRun" : "multirun",
  };
  #featureMethods = {
    "tokenex" : { name: "tokenex", serverKey: "tokenExchange", prepMethod: "prepareTokenExchange", runMethod: "exchangeToken" },
    "poolreb" : { name: "poolreb", serverKey: "poolRebalance", prepMethod: "preparePoolRebalance" , runMethod: "rebalancePool" }
  };
  #messages = {
    "setup": {
      "extensionInstall": `
      [ Use this to install and set the browser components ]\n
      ✔️ [1] Setup the following to proceed
          ⇨ Install Google chrome
          ⇨ Metamask wallet extension is added from Google chrome extension store
            ⚉ https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en
          ⇨ app.config.json is updated correctly
            ⚉ version
            ⚉ folderName
            ⚉ browserUrl
            ⚉ localPath
            ⚉ userProfileDataPath

      ✔️ [2] Check if you are using the correct version.
      ✔️ [3] Update the extension setting. Go to chrome://extensions/?id=nkbihfbeogaeaoehlefnkodbefgpgknn
          ⇨ Allow in Incognito = true
          ⇨ Allow access to file URLs = true
          ⇨ Collect errors = true
          ⇨ allow automatic updates off

      ✔️ [4] Pin the wallet extension from the upper right corner of the address bar
      ✔️ [5] Go to the following URL to setup the wallet
          ⇨ chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#initialize/welcome
      
      ✔️ [6] Save the account to a file. 
      ✔️ [7] Setup the network chain.
      ✔️ [8] Create a new account and then import the private key.
      ✔️ [9] Add the tokens - make sure you are using the correct network chain.
      ✔️ [10] After the wallet setup, confirm the following setting
        ⇨ Smart Chain Network
        ⇨ Tokens - should have a default amount > 0

      ✔️ [11] Close the browser.
      ✔️ [12] Access and login to the page to test the wallet connection.
        (Approve the prompts if needed to avoid conflict with the bot operation)
        ⇨ chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#

      ✔️ [13] Confirm that you're connected to the smart chain network.
      ✔️ [14] You are all set. Start some dry run to test the system.

    `,
    "walletSetup": `[ Please setup your wallet information ]\n
    ✔️ If this is your first time opening this page, you might need to import your keys or account.
    ✔️ Make sure to setup the chain network and tokens correctly.
    ✔️ Keep your password in a safe place.
    ✔️ Close this screen once the setup is complete.
    
    ⚠️ If the wallet is compromised, delete the user data or reinstall the extension then rerun this setup.`
    },
    "invalidAccountFile": ` >> Invalid account. Either file does not exist or format is incorrect.`,
    "invalidTokenPair": ` >> Cannot proceed. Token pair setting does not exist.`,
    "invalidPoolKey": ` >> Cannot proceed. Pool key does not exist.`,
    "dryRun": `[ Check the following settings ]

    ✔️ Wallet is connected
    ✔️ Tokens are set correctly
    
    ⚠️ Wallet is usually disconnected after the initial setup.
    If you are not sure the wallet is connected or the tokens are set,
    copy the current URL and run the browser setup.

    Once set, do another dry run to confirm.
    `,
};

  constructor(platform) {
    this.#platform = platform;
    const _rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.#readlineQuestion = util.promisify(_rl.question).bind(_rl);
  }

  _platformObj() {
    return this.#platform;
  }

  _featureToArray() {
    let _list = [];
    for (const [key, value] of Object.entries(this.features)) {
      _list.push(value);
    }
    return _list;
  }

  async app(param) {
    const options = param.options;
    if(options.debug) { return console.log(param); };
    if(options.setup) { return this._setup(param) };
    if(options.dryRun) { return this._dryRun(param) };
    if(options.run) { return this._run(param) };
  }

  async _setup(param) {
    const _feature = param.options.setup;
    const _platform = this._platformObj();
    const _setupMessages = this.#messages.setup;
    let _message, _page;

    switch(_feature) {
      case this.features.browserSet:
        _message = _setupMessages.extensionInstall;
        _page = await _platform.preSetup(_message);
        return await _platform.showMessage(_page, _message);

      case this.features.walletConnection:
        _message = _setupMessages.walletSetup;
        await _platform.setup();
        _page = await _platform.openWallet();
        return await _platform.showMessage(_page, _message);

      default:
        console.log(` >> Unknown value for setup: ${_feature}`);
        process.exit();
    }
  }

  async _dryRun(param) {
    const _feature = param.options.dryRun;
    const _tokenPairKey = param.options.tokenPairKey;
    const _poolKey = param.options.poolKey;
    const _platform = this._platformObj();
    const _messageInvalidAccount = this.#messages.invalidAccountFile;
    const _messageTokenPair = this.#messages.invalidTokenPair;
    const _messagePoolKey = this.#messages.invalidPoolKey;
    const _dryRunMessage = this.#messages.dryRun;
    
    let _server, _accountFile;

    switch(_feature) {
      case this.features.walletConnection:
        _accountFile = await this._getAccountFile();
        if(!_accountFile.valid) {
          console.log(_messageInvalidAccount);
          process.exit();
        }
        
        await _platform.setup();
        return await _platform.connectToWallet(_accountFile.account);
      
      case this.features.tokenExchange:
        if(_tokenPairKey == undefined) {
          console.log(_messageTokenPair);
          console.log('Try to run : app.js -d tokenex -t <tokenPairKey>');
          process.exit();
        }

        _accountFile = await this._getAccountFile();
        if(!_accountFile.valid) {
          console.log(_messageInvalidAccount);
          process.exit();
        }

        await _platform.setup();
        await _platform.connectToWallet(_accountFile.account);

        _server = await _platform.createServer('tokenExchange', _tokenPairKey);
        await _platform.showMessage(_server.page, _dryRunMessage);
        return await _platform.useServer(_server).prepareTokenExchange();

      case this.features.poolRebalance:
        if(_poolKey == undefined) {
          console.log(_messagePoolKey);
          console.log('Try to run : app.js -r poolreb -p <poolKey>');
          process.exit();
        }

        _accountFile = await this._getAccountFile();
        if(!_accountFile.valid) {
          console.log(_messageInvalidAccount);
          process.exit();
        }

        await _platform.setup();
        await _platform.connectToWallet(_accountFile.account);

        _server = await _platform.createServer('poolRebalance', _poolKey);
        await _platform.showMessage(_server.page, _dryRunMessage);
        return await _platform.useServer(_server).preparePoolRebalance();

      case this.features.multiRun:
        return await this._multiRun(param);

      default:
        console.log(` >> Unknown feature to dry-run: ${_feature}`);
        process.exit();
    }
  }

  async _run(param) {
    const _feature = param.options.run;
    const _tokenPairKey = param.options.tokenPairKey;
    const _poolKey = param.options.poolKey;
    const _platform = this._platformObj();
    const _messageInvalidAccount = this.#messages.invalidAccountFile;
    const _messageTokenPair = this.#messages.invalidTokenPair;
    const _messagePoolKey = this.#messages.invalidPoolKey;
    const _loopCount = this._getLoopCount(param);
    const _executionInterval = this._getExecutionInterval(param);
    let _loopRunner = 0;
    let _server, _accountFile;

    switch(_feature) {
      case this.features.tokenExchange:
        if(_tokenPairKey == undefined) {
          console.log(_messageTokenPair);
          console.log('Try to run : app.js -r tokenex -t <tokenPairKey>');
          process.exit();
        }

        _accountFile = await this._getAccountFile();
        if(!_accountFile.valid) {
          console.log(_messageInvalidAccount);
          process.exit();
        }

        await _platform.setup();
        await _platform.connectToWallet(_accountFile.account);
        _server = await _platform.createServer('tokenExchange', _tokenPairKey);
        
        while(_loopRunner < _loopCount || _loopCount == 0) {
          LoggingService.running(`  >> Feature execution started: ${_feature} , looping ${_loopRunner+1} of ${_loopCount} ...`);
          await _platform.useServer(_server).exchangeToken();
          LoggingService.running(`  >> Feature execution ended ...`);

          if(_loopRunner != _loopCount-1) {
            LoggingService.running(`  >> ❄️❄️❄️ Frozen for ${_executionInterval} seconds ...`);  
            await _server.page.waitForTimeout(_executionInterval*1000);
          }
          _loopRunner++;
        }

        return process.exit();

      case this.features.poolRebalance:
        if(_poolKey == undefined) {
          console.log(_messagePoolKey);
          console.log('Try to run : app.js -r poolreb -p <poolKey>');
          process.exit();
        }

        _accountFile = await this._getAccountFile();
        if(!_accountFile.valid) {
          console.log(_messageInvalidAccount);
          process.exit();
        }

        await _platform.setup();
        await _platform.connectToWallet(_accountFile.account);

        _server = await _platform.createServer('poolRebalance', _poolKey);

        while(_loopRunner < _loopCount || _loopCount == 0) {
          LoggingService.running(`  >> Feature execution started: ${_feature} , looping ${_loopRunner+1} of ${_loopCount} ...`);
          await _platform.useServer(_server).rebalancePool();
          LoggingService.running(`  >> Feature execution ended ...`);

          if(_loopRunner != _loopCount-1) {
            LoggingService.running(`  >> ❄️❄️❄️ Frozen for ${_executionInterval} seconds ...`);
            await _server.page.waitForTimeout(_executionInterval*1000);
          }
          _loopRunner++;
        }

        return process.exit();

      case this.features.multiRun:
        await this._multiRun(param, true);
        return process.exit();
      
      default:
        console.log(` >> Unknown feature to run: ${_feature}`);
        process.exit();
    }
  }

  async _multiRun(param, run) {
    const _features = param.options.multiRun;
    const _featuresArguments = param.options.multiRunArgs;
    const _messageInvalidAccount = this.#messages.invalidAccountFile;
    const _platform = this._platformObj();
    const _featureMethods = this.#featureMethods;
    const _dryRunMessage = this.#messages.dryRun;
    const _loopCount = this._getLoopCount(param);
    const _executionInterval = this._getExecutionInterval(param);
    const _groupExecutionInterval = this._getGroupExecutionInterval(param);
    const _allowedFeatures = [
      _featureMethods.tokenex.name,
      _featureMethods.poolreb.name
    ];
    let _loopRunner = 0;

    const _txPrepMethods = async function(platform, feature) {
      switch(feature) {
        case _allowedFeatures[0] : return await platform.prepareTokenExchange();
        case _allowedFeatures[1] : return await platform.preparePoolRebalance();
      }
    };

    const _txRunMethods = async function(platform, feature) {
      switch(feature) {
        case _allowedFeatures[0] : return await platform.exchangeToken();
        case _allowedFeatures[1] : return await platform.rebalancePool();
      }
    };

    const _txRunner = async function(serverList, run, groupNumber) {
      let _server;
      const _runner = (run)? async function(server, i) {

        await _txRunMethods(_platform, _features[i]);
      } : async function(server, i) {

        await _platform.showMessage(server.page, _dryRunMessage);
        await _txPrepMethods(_platform, _features[i]);
      };

      for(var i = 0; i < serverList.length; i++) {
        LoggingService.running(`  >> Group Number: ${groupNumber}`);
        LoggingService.running(`  >> Feature execution started: ${_features[i]}, feature ${i+1} of ${_features.length} ...`);
        _server = serverList[i];
        await _platform.useServer(_server);
        await _runner(_server, i);

        LoggingService.running(`  >> Feature execution ended: ${_features[i]} ...`);
        LoggingService.running(`  >> ❄️❄️❄️  Frozen for ${_executionInterval} seconds ...`);
        await _server.page.waitForTimeout(_executionInterval*1000);
      }

      return _server;
    }

    const _cleanParameters = function() {
      _features.pop();
      _features.shift();
      _featuresArguments.pop();
      _featuresArguments.shift();
    }

    const _formatIsCorrect = function(p) {
      const _length = p.length;
      return (p[0] == '[' && p[_length-1] == ']')
    }

    const _allFeatureIsAllowed = function(features) {
      for (var i = 0; i < features.length; i++) {
        if(_allowedFeatures.indexOf(features[i]) === -1) {
          return false;
        }
      }

      return true;
    }

    const _featureAndArgumentsMatched = function(features, featuresArguments) {
      return (features.length === featuresArguments.length);
    }

    const _allowedFeaturesList = function() {
      let _list = [];
      _allowedFeatures.forEach( f => {
        _list.push("    → " + f);
      });

      return _list;
    }

    const _createServer = async function() {
      let _serverList = [];
      let _server = [];

      for(var x = 0; x < _features.length; x++) {
        _server = await _platform.createServer(
          _featureMethods[_features[x]].serverKey,
          _featuresArguments[x]
        );
        _serverList.push(_server);
      }

      return _serverList;
    }

    if(!_featuresArguments) {
      console.log(
        ` >> Features arguments do not exist.\n`+
        ` >> Set the value for -n or check the --help for more details.`
      );
      return process.exit();
    }

    if(
      !_formatIsCorrect(param.options.multiRun) ||
      !_formatIsCorrect(param.options.multiRunArgs)
    ) {
      console.log(
        ` >> Features/Feature arguments are not properly formatted.\n`+
        ` >> Enclose your features within a [](square brackets)\n\n`+
        ` i.e. -m [ feature1 feature2... ] -n [ featureArgs1 featureArgs2... ]`
      );
      return process.exit();
    }

    _cleanParameters();
    if(!_allFeatureIsAllowed(_features)) {
      console.log(
        ` >> Unknown feature is set.\n  `+
        ` >> Only the following features are allowed.\n`+
        _allowedFeaturesList().join("\n")
      );

      return process.exit();
    }

    if(!_featureAndArgumentsMatched(_features, _featuresArguments)) {
      console.log(` >> Feature and feature arguments should be matched.\n `);
      return process.exit();
    }

    const _accountFile = await this._getAccountFile();
    if(!_accountFile.valid) {
      console.log(_messageInvalidAccount);
      process.exit();
    }

    await _platform.setup();
    await _platform.connectToWallet(_accountFile.account);
    const _serverList = await _createServer();
    let _lastServer;

    while(_loopRunner < _loopCount || _loopCount == 0) {
      LoggingService.running(`  >> Group feature execution started: ${_loopRunner+1} of ${_loopCount} ...`);
      _lastServer = await _txRunner(_serverList, run, `${_loopRunner+1} of ${_loopCount}`);
      
      LoggingService.running(`  >> ❄️❄️❄️  Group feature frozen for ${_groupExecutionInterval} seconds..`);
      LoggingService.running(`  >> Group feature execution ended: ${_loopRunner+1} of ${_loopCount} ...`);
      
      if(_loopRunner != _loopCount-1) {
        await _lastServer.page.waitForTimeout(_groupExecutionInterval*1000);
      }
      _loopRunner++;
    }

  }

  async _getAccountFile() {
    const _defaultAccountFile = "./.config/" + this.#defaultAccountFile;
    let _filePath = await this.#readlineQuestion(` >> Enter account file [ ${_defaultAccountFile} ]: `);
    _filePath = (_filePath.trim() == '')? _defaultAccountFile : _filePath;
    const _account = this._openFile(_filePath);

    return {
      account: _account,
      valid: !((_account == null || !this._validAccount(_account)))
    };
  }

  _openFile(file) {
    try {
      if(!fs.existsSync(file)) { return null;} 
      return JSON.parse(fs.readFileSync(file));
    } catch(e) {
      console.error("Cannot read. Check the file and try again.");
      return null;
    }
  }

  _validAccount(account) {
    if(account.username == undefined || account.password == undefined) {
      return false;
    }
    return true;
  }

  _getExecutionInterval(param) {
    return (
      (param.options.interval)?
        parseInt(param.options.interval) : 0
    );
  }

  _getGroupExecutionInterval(param) {
    return (
      (param.options.groupInterval)?
        parseInt(param.options.groupInterval) : 0
    );
  }

  _getLoopCount(param) {
    const _count = parseInt(param.options.loop);

    if(param.options.loop) {
      if(!Number.isInteger(_count) || _count < 0) {
        console.log(" >> Loop value is invalid. Allowed value starts from 0")
        return process.exit();
      }

      return _count;
    }

    return 1;
  }
}