import { Command } from 'commander';
import { DodoExPlatform } from './src/lib/domain/platform/dodoex/dodoex-platform.js';
import { DodoExPlatformSetting } from  "./src/lib/domain/platform/dodoex/dodoex-platform-setting.js";
import { MetaMaskWallet } from  "./src/lib/model/wallet/metamask-wallet.js";
import { MetaMaskWalletSetting } from  "./src/lib/model/wallet/metamask-wallet-setting.js";
import { CliRunner } from './src/app/cli-runner.js';
import { LoggingService } from './src/lib/service/logging-service.js';

let platformSetting = new DodoExPlatformSetting(
  new MetaMaskWallet(
    new MetaMaskWalletSetting()
  )
);

const cmd = new Command();
const cliRunner = new CliRunner(new DodoExPlatform(platformSetting));

cmd
  .option('-s, --setup <feature>', 'setting up a feature')
  .option('-d, --dry-run <feature>', 'execute a dry-run or test run of the feature')
  .option('-r, --run <feature>', 'execute a feature')
  .option('-m, --multi-run [feature...]', 'execute multiple features')
  .option('-n, --multi-run-args [featureArgs...]', 'used in conjunction with --multi-run')
  .option('-t, --token-pair-key <tokenPairKey>', 'set the token pair to use')
  .option('-p, --pool-key <poolKey>', 'set the pool key to use')
  .option('-l, --loop <loopCount>', 'run for specified number of times. Set 0 to run infinitely')
  .option('-i, --interval <seconds>', 'pause per feature execution in seconds')
  .option('-g, --group-interval <seconds>', 'pause per group feature execution in seconds - used in conjunction with --multi-run')
  .option('-b, --debug', 'debug the parameters')
  .addHelpText('after', `

  [ A 'feature' could be one of the following ]
   Some features are not applicable to all parameters\n${getFeatures().join("\n")}

  [ 'tokenPairKey' and 'poolKey' are keys existing in the app's configuration ]

  [ Example call ] :

    # Opens up the app browser to configure the wallet
    # or confirm any setting

    $ app -s browser

    # Execute token exchange dry-run

    $ app -d tokenex -t <tokenPairKey>
    $ app -d tokenex -t <tokenPairKey> -l 0
`
);
cmd.version("1.3.0");
cmd.parse(process.argv);

try {
  runApp();
} catch(e) {
  LoggingService.error(" [ ERROR ENCOUNTERED ]  ");
  LoggingService.errorMessage(e);
}

function runApp() {
  const options =  cmd.opts();
  cliRunner.app({options: options});
}

function getFeatures() {
  let _list = [];
  for (const [key, value] of Object.entries(cliRunner.features)) {
    _list.push("    → " + value);
  }
  return _list;
}