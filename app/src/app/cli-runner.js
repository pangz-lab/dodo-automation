import readline from 'readline';
import util from 'util';
import fs from "fs";

export class CliRunner {
  #platform;
  #readlineQuestion;
  #defaultAccountFile = "./account.json";
  features = {
    "browserSet" : "browser",
    "walletConnection" : "wallet",
    "tokenExchange" : "tokenex",
    "poolRebalance" : "poolreb",
  };
  #messages = {
    "setup": {
      "extensionInstall": `
      [ Use this to install and set the browser components ]\n
      ✔️ Setup the following to proceed
          ⇨ Install Google chrome
          ⇨ Metamask wallet extension is added from Google chrome extension store
            ⚉ https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en
          ⇨ app.config.json is updated correctly
            ⚉ version
            ⚉ folderName
            ⚉ browserUrl
            ⚉ localPath
            ⚉ userProfileDataPath

      ✔️ Check if you are using the correct version.
      ✔️ Update the extension setting. Go to chrome://extensions/?id=nkbihfbeogaeaoehlefnkodbefgpgknn
          ⇨ Allow in Incognito = true
          ⇨ Allow access to file URLs = true
          ⇨ Collect errors = true
          ⇨ allow automatic updates off

      ✔️ Pin the wallet extension from the upper right corner of the address bar
      ✔️ Go to the following URL to setup the wallet
          ⇨ chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#initialize/welcome
      
      ✔️ Save the account to a file. 
      ✔️ Setup the network chain.
      ✔️ Create a new account and then import the private key.
      ✔️ Add the tokens - make sure you are using the correct network chain.
      ✔️ After the wallet setup, confirm the following setting
        ⇨ Smart Chain Network
        ⇨ Tokens - should have a default amount > 0

      ✔️ Close the browser.
      ✔️ Access and login to the page to test the wallet connection.
        (Approve the prompts if needed to avoid conflict with the bot operation)
        ⇨ chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#

      ✔️ Confirm that you're connected to the smart chain network.
      ✔️ You are all set. Start some dry run to test the system.

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

  async app(param) {
    const options = param.options;
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
          await _platform.useServer(_server).exchangeToken();
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
          await _platform.useServer(_server).rebalancePool();
          _loopRunner++;
        }

        return process.exit();
      
      default:
        console.log(` >> Unknown feature to run: ${_feature}`);
        process.exit();
    }
  }

  async _getAccountFile() {
    const _defaultAccountFile = this.#defaultAccountFile;
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