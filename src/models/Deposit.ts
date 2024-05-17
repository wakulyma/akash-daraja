import { Schema, model } from "mongoose";

//for fiat wallets

const DepositSchema = new Schema<IDeposit>({
  referenceId: {
    type: String,
    //required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  processed: {
    type: Boolean,
    required: true,
    default: false,
  },
  processingStatus: {
    type: String,
    required: true,
    default: "INPROGRESS",
  },
  depositedInWallet: {
    type: Boolean,
    required: true,
    default: false,
  },
  timeInitiated: {
    type: Number,
    required: true,
  },
  timeDeposited: {
    type: Number,
  },
  paymentGateway: {
    type: String,
    required: true,
  },
  msg: {
    type: String,
  },
  currency: {
    type: String,
  },
  walletAddress: {
    type: String,
  },
});

export const Deposit = model<IDeposit>("Deposit", DepositSchema);
