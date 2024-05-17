# Akash-Daraja

This is the fiat-to-crypto onramp for the akash network. It makes use of stripe APIs to create and settle fiat deposits for users, and another wallet from which funds are transferred when the user's deposit is confirmed from Stripe. It currently runs on the Akash testnet, using tokens acquired from the faucet. In the real world, these would be purchased from DEXes using tokenized deposits, further increasing the profitability and sustainability of the protocol. The service therefore has a limited number of tokens to work with for the demo.

# Interface
This is currently an api solution, with three endpoints abstracting a lot of the processes. This makes for easy integration by other platforms and apps.

## /POST   /daraja/api/v1/signup
Signs up the user for the service.

## /POST /daraja/api/v1/login
Signs in existing users.

## /POST /daraja/api/v1/deposit
Initiates fiat transfer from the user and AKT tokens transfer from the service to the user-provided wallet address.

### Future Work:
- Deposits will be tokenized, to enable real-time representation of the cash deposits pooled. The tokens minted from this will therefore have a cash-based backing, and will be tradeable on DEXes.
- The solution will be transformed into a full onramp and offramp solution, implemented as a DEX Liquidity pool for AKT against Tokenized Deposits. This will enable the protocol to operate in an automated manner.
- Remove the need for signup, enabling users to initiate a deposit using only their wallet address and email
