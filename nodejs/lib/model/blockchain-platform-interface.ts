export interface BlockchainPlatformInterface {
  setup(): void;
  connectToWallet(): boolean;
  swapToken(sourceToken: String, destinationToken: String): boolean;
  rebalancePool(sourceToken: String, destinationToken: String): boolean;
}