import {
  SigningStargateClient,
  assertIsDeliverTxSuccess,
} from "@cosmjs/stargate";
import { Secp256k1HdWallet } from "@cosmjs/amino";
import { config } from "../../config/config";
import { getAktPrice } from "../getAktPrice";

const mnemonic = config.COSMOS_MNEMONIC;

const rpcEndpoint = config.AKASH_RPC_URL;

//transfers AKT to user's wallet address after deposit is confirmed by payment gateway
export const transferAKT = async (
  recipient_: string,
  USD_Amount_In_Cents: number
) => {
  try {
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "akash",
    });

    const [senderAccount] = await wallet.getAccounts();

    const client = await SigningStargateClient.connectWithSigner(
      rpcEndpoint,
      wallet
    );

    //convert AKT price to big int
    let price = (await getAktPrice()) * 100; //convert price to be in cents
    let priceStr = price.toString();
    let numOfDecimalPlaces = priceStr.split(".")[1].length;

    //convert usd amount and AKT price to BigInt by raising to the number of decimal places in the price representation
    let _amount = BigInt(USD_Amount_In_Cents * 10 ** numOfDecimalPlaces);

    //return AKT price as bigint, having converted it to cents
    let _aktPrice = BigInt(price * 10 ** numOfDecimalPlaces);
    //and get the number of tokens for the amount at the current exchange rate
    let numberOfTokens = _amount / _aktPrice;

    //Charge a 1% fee for the protocol,akash has 6 decimal places,
    let transformations = BigInt(0.99 * 10 ** 6);

    const recipient = recipient_; //user's AKT address

    const amount = {
      denom: "uakt", //akash token
      amount: (numberOfTokens * transformations).toString(),
    };

    const fee = {
      amount: [
        {
          denom: "uakt",
          amount: "4500", //gas fee
        },
      ],
      gas: "100000", // amount of gas wanted for transfer
    };
    const result = await client.sendTokens(
      senderAccount.address,
      recipient,
      [amount],
      fee
    );

    const txHash = result.transactionHash;

    assertIsDeliverTxSuccess(result);

    console.log(`made transfer of ${amount.amount} to wallet ${recipient}, \n`);

    //TODO: send email of successful purchase to user
  } catch (error) {
    console.log(error);
    //TODO: email relevant error messages to user
  }
};
