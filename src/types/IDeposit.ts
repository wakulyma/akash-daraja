interface IDeposit {
  referenceId: string;
  paymentGateway: string;
  userId: string;
  amount: number;
  processed: boolean;
  processingStatus: string;
  depositedInWallet: boolean;
  timeInitiated: any;
  timeDeposited: any;
  msg: string;
  currency: string;
  walletAddress: string;
}
