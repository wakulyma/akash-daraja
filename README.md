# akash-daraja

This is the fiat-to-crypto onramp for the akash network

# Proposal for how the protocol is going to work:

        //when deposit intent is initiated, create the document in db, and store the hash of this document in the smart contract/chain
        //then redirect user to the stripe checkout page where they pay fiat for the equal amount of tokens they want

        //when stripe webhook hits:

        //verify the hash of the db document compared to what is stored on-chain: use the reference id as key:
          //{
          //we should therefore replicate the dbs, and read operations will always happen only on these slave dbs;
          //the protocol's validator nodes run the master dbs.
          //}
          //
          //if hash verifies or checks out proceed to  transfer the crypto to the user (stablecoin, usdc)

          //logic to transfer to user's wallet address onchain goes HERE: only verified addresses can call this: we run these nodes for now ✅✅
          // (validators, or those running these nodes )

          //if fails or reverted, update status in db and store hash again,
          //if successful, also update status in db and store hash again

          //fees can be collected on the smart contract to cater for the server nodes and wallets sponsoring transaction gas fees.
          //this can introduce a staking mechanism, whereby users stake with these `validator nodes` for a share of the fees; or jut deposit into a liquidity pool and get LP tokens for facilitating the trades/conversions.
          //to balance the liquidity pool, it can be a whole onramp and offramp situation to keep cash deposits and token amounts balanced.
          //part of the fees will also go to the protocol
          //
          //if we are to mint our own token, validator nodes/data producers only receive a fee from the amount minted:
          // It's better to use a liquidity pool.✅✅
          //list of validators is to be updated by the protocol's governance council. The protocol governance can be PoA based, or have governance tokens issued. LP tokens can be the governance tokens

          //db can be replaced with decentralized storage e.g jackal
