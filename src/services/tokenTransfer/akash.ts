import { SigningStargateClient, assertIsDeliverTxSuccess } from "@cosmjs/stargate";
import { Secp256k1HdWallet } from "@cosmjs/amino";

const mnemonic = "coral fly first shrimp plunge fruit work maximum history dry pet recycle"

const rpcEndpoint = "https://rpc.sandbox-01.aksh.pw:443"



export const transferAKT = async (recipient_: string, USD_Amount_In_Cents: number)=>{
   try {
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {prefix:"akash"})
    
    const [senderAccount] = await wallet.getAccounts()
    
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet)

    const recipient = recipient_ //user's AKT address
    const amount = {
        denom: "uakt", //akash token
        amount: (USD_Amount_In_Cents * (10**6)/100).toString() //akash has 6 decimal places, 
    }
    
    const fee = {
        amount: [
          {
            denom: "uakt",
            amount: "4500", //gas fee
          },
        ],
        gas: "100000", // amount of gas wanted for transfer
      };
    const result = await client.sendTokens(senderAccount.address, recipient,[amount],fee)

    const txHash = result.transactionHash
    
    assertIsDeliverTxSuccess(result)

    //send email of successful purchase to user
   } catch (error) {
    console.log(error);
    //email relevant error messages to user
    
   }
    

    
}

