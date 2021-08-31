import { Command } from 'commander';
import { DodoExPlatform } from './src/lib/domain/platform/dodoex/dodoex-platform.js';
import { DodoExPlatformSetting } from  "./src/lib/domain/platform/dodoex/dodoex-platform-setting.js";
import { MetaMaskWallet } from  "./src/lib/model/wallet/metamask-wallet.js";
import { MetaMaskWalletSetting } from  "./src/lib/model/wallet/metamask-wallet-setting.js";
import { CliRunner } from './src/app/cli-runner.js';

let platformSetting = new DodoExPlatformSetting(
  new MetaMaskWallet(
    new MetaMaskWalletSetting()
  )
);

const cmd = new Command();
const cliRunner = new CliRunner(new DodoExPlatform(platformSetting));

const featureParams = [
  cliRunner.features.walletConnection,
  cliRunner.features.tokenExchange,
  cliRunner.features.poolRebalance,
];

cmd
  .option('--setup <feature>', 'setting up a feature')
  .option('--dry-run <feature>', 'execute a dry-run or test run of the feature')
  .option('--run <feature>', 'execute a feature')
  .option('--token-pair <tokenPair>', 'specify the token pair to use')
  // .requiredOption('-f, --feature <feature>', 'feature to execute', _app)
  // .addOption(new Option('-s, --setup <feature>', 'setting up a feature').choices([features.walletConnection]))
  // .addOption(new Option('-d, --dryrun <feature>', 'execute a dryrun of the feature').choices(featureParams))
  // .addOption(new Option('-r, --run <feature>', 'execute a feature').choices(featureParams));

/**
 const options = cmd.opts();
 if (options.debug) console.log(options);
 console.log('pizza details:');
 if (options.small) console.log('- small pizza size');
 if (options.pizzaType) console.log(`- ${options.pizzaType}`);
 */
 const options = cmd.opts();
cmd.parse(process.argv);
runApp();

function runApp() {
  const options =  cmd.opts();
  cliRunner.app({options: options});
}
