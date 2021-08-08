## Setup

1. install node and npm - setup for dev
  - npm install -g typescript #for typescript
2. install chrome
3. install metamask in firefox extension; setup with the following setting
  - allow in private mode
  - allow automatic updates off
  - open in private mode and setup the accounts and coins
    * setup the smart chain network (add network) 
    ```
      Network Name: Smart Chain
      New RPC URL: https://bsc-dataseed.binance.org/
      ChainID: 56
      Symbol: BNB
      Block Explorer URL: https://bscscan.com
    ```
    * setup the token
    ```
      500G  0xae60930454458f5d04cae41a9d127e786e90f40a
      500DC 0xf92aa7543e38684afec679ceffae02675dccbdfc
    ```
4. run script to setup metamask accounts and coins
5. save the password to a file
6. run the script



const platform = new DodoExPlatform();
const wallet = new MetamaskWallet();

platform.setup(new DodoExSetting({
  wallet: wallet,
}));

platform.login();
platform.connectToWallet();
platform.swap('500G','500DC');