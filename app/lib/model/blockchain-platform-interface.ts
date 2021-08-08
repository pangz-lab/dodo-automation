export interface BlockchainPlatformInterface {
  setup(): void;
  login(): boolean;
  connectToWallet(): boolean;
  swapToken(sourceToken: String, destinationToken: String): boolean;
  rebalancePool(sourceToken: String, destinationToken: String): boolean;
}