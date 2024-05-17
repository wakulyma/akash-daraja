import { Schema, model } from "mongoose";
import { IWallet } from "../types/IWallet";

const WalletSchema = new Schema<IWallet>({
  ownerID: {
    type: String,
    required: true,
  },
  currentBalance: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
});

export const Wallet = model<IWallet>("Wallet", WalletSchema);
