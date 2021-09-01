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

cmd
  .option('-s, --setup <feature>', 'setting up a feature')
  .option('-d, --dry-run <feature>', 'execute a dry-run or test run of the feature')
  .option('-r, --run <feature>', 'execute a feature')
  .option('-t, --token-pair-key <tokenPairKey>', 'set the token pair to use')
  .option('-p, --pool-key <poolKey>', 'set the pool key to use')
  .option('-l, --loop <loopCount>', 'run for specified number of iteration. Set 0 to run infinitely')
  .parse(process.argv);

runApp();

function runApp() {
  const options =  cmd.opts();
  cliRunner.app({options: options});
}
