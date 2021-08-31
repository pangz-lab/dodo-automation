import readline from 'readline';
import util from 'util';
import fs from "fs";

export class CliRunner {
  #platform;
  #readlineQuestion;
  features = {
    "walletConnection" : "wallet-connection",
    "tokenExchange" : "token-exchange",
    "poolRebalance" : "pool-reblance ",
  };
  #messages = {
    "setup": {
      "walletSetup": `[ Please setup your wallet information ]\n
    ✔️ If this is your first time opening this page, you might need to import your keys or account.
    ✔️ Make sure to setup the chain network and tokens correctly.
    ✔️ Keep your password in a safe place.
    ✔️ Close this screen once the setup is complete.
    
    ⚠️ If the wallet is compromised, delete the user data or reinstall the extension then rerun this setup.`
    }
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

    if(options.setup) return this._setup(param);
    if(options.dryRun) return this._dryRun(param);
    if(options.run) return this._run(param);
  }

  async _setup(param) {
    const _feature = param.options.setup;
    const _platform = this._platformObj();
    const _setupMessages = this.#messages.setup;

    switch(_feature) {
      case this.features.walletConnection:
        const _message = _setupMessages.walletSetup;
        await _platform.setup();
        const _page = await _platform.openWallet();
        await _platform.showMessage(_page, _message);
      break;
      default: console.log(` >> Unknown value for setup: ${_feature}`);
    }
  }

  async _dryRun(param) {
    const _feature = param.options.dryRun;
    const _platform = this._platformObj();

    switch(_feature) {
      case this.features.walletConnection:
        const _filePath = await this.#readlineQuestion(' >> Enter account file: ');
        const _account = this._openFile(_filePath);

        if(_account == null || !this._validAccount(_account)) {
          console.log(" >> Invalid account. Either file does not exist or format is incorrect.");
          process.exit();
        }
        await _platform.setup();
        return await _platform.connectToWallet(_account);
      
      case this.features.tokenExchange:
        if(param.tokenPair == undefined) {
          console.log(" >> Cannot proceed. Token pair setting does not exist");
          process.exit();
        }
        const _server = await platform.createServer('tokenExchange', param.tokenPair);
        await _platform.useServer(_server).exchangeToken();
 
        break;
      
      default: console.log(` >> Unknown feature to dry-run: ${_feature}`);
    }
  }

  async _run() {

  }

  async _manageFeature() {

  }

  _openFile(file) {
    try {
      if(!fs.existsSync(file)) {
        return null;
      } 
      const _data = JSON.parse(fs.readFileSync(file));
      return _data;
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
}