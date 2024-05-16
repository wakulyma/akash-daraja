import { Request, Response } from "express";
import { config } from "../config/config";
import Stripe from "stripe";
import { Deposit } from "../models/Deposit";

const STRIPE_SECRET = config.STRIPE_API_KEY;

const STRIPE_ENDPOINT_SECRET = config.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(STRIPE_SECRET);

export const processStripeEvent = async (req: Request, res: Response) => {
  try {
    const sig = req.headers["stripe-signature"];

    console.log(STRIPE_ENDPOINT_SECRET);

    let event;

    if (!sig) {
      console.log(`Webhook Error: no stripe-signature header`);

      return res.status(400).send(`Webhook Error: no stripe-signature header`);
    }

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_ENDPOINT_SECRET
      );
    } catch (err: any) {
      console.log("stripe webhook verification failed");

      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    res.status(200).json({ received: true });

    // Handle the event
    switch (event.type) {
      case "checkout.session.async_payment_failed":
        const checkoutSessionAsyncPaymentFailed = event.data.object;
        // Then define and call a function to handle the event checkout.session.async_payment_failed
        console.log(checkoutSessionAsyncPaymentFailed);

        break;
      case "checkout.session.async_payment_succeeded":
        const checkoutSessionAsyncPaymentSucceeded = event.data.object;
        // Then define and call a function to handle the event checkout.session.async_payment_succeeded
        console.log(checkoutSessionAsyncPaymentSucceeded);

        break;
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        // Then define and call a function to handle the event checkout.session.completed
        console.log("Checkout session completed");

        let checkoutSessionDB = await Deposit.findOne({
          referenceId: checkoutSessionCompleted.id,
        });

        if (checkoutSessionDB) {
          //verify the hash of the db document compared to what is stored on-chain: use the reference id as key:
          //{
          //we should therefore replicate the dbs, and read operations will always happen only on these slave dbs;
          //the protocol's validator nodes run the master dbs.
          //}
          //
          //if hash verifies or checks out proceed to  transfer the crypto to the user (stablecoin, usdc)

          //logic to transfer to user's wallet address onchain goes HERE: only verified addresses can call this:
          // (validators, or those running these nodes )

          //if fails or reverted, update status in db and store hash again,
          //if successful, also update status in db and store hash again

          //fees can be collected on the smart contract to cater for the server nodes and wallets sponsoring transaction gas fees.
          //this can introduce a staking mechanism, whereby users stake with these `validator nodes` for a share of the fees; or jut deposit into a liquidity pool and get LP tokens for facilitating the trades/conversions.
          //to balance the liquidity pool, it can be a whole onramp and offramp situation to keep cash deposits and token amounts balanced.
          //part of the fees will also go to the protocol
          //
          //if we are to mint our own token, validator nodes/data producers only receive a fee from the amount minted. It's better to use a liquidity pool.
          //list of validators is to be updated by the protocol's governance council. The protocol governance can be PoA based, or have governance tokens issued. LP tokens can be the governance tokens
          checkoutSessionDB.processed = true;
          await checkoutSessionDB.save();
          //emit results in email for the user
        }

        console.log(checkoutSessionCompleted);

        break;
      case "checkout.session.expired":
        const checkoutSessionExpired = event.data.object;
        // Then define and call a function to handle the event checkout.session.expired
        console.log(checkoutSessionExpired);

        break;
      case "payment_intent.amount_capturable_updated":
        const paymentIntentAmountCapturableUpdated = event.data.object;
        // Then define and call a function to handle the event payment_intent.amount_capturable_updated
        console.log(paymentIntentAmountCapturableUpdated);

        break;
      case "payment_intent.canceled":
        const paymentIntentCanceled = event.data.object;
        // Then define and call a function to handle the event payment_intent.canceled
        console.log(paymentIntentCanceled);

        break;
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object;
        // Then define and call a function to handle the event payment_intent.created
        console.log(paymentIntentCreated);

        break;
      case "payment_intent.partially_funded":
        const paymentIntentPartiallyFunded = event.data.object;
        // Then define and call a function to handle the event payment_intent.partially_funded
        console.log(paymentIntentPartiallyFunded);

        break;
      case "payment_intent.payment_failed":
        const paymentIntentPaymentFailed = event.data.object;
        // Then define and call a function to handle the event payment_intent.payment_failed
        console.log(paymentIntentPaymentFailed);

        break;
      case "payment_intent.processing":
        const paymentIntentProcessing = event.data.object;
        // Then define and call a function to handle the event payment_intent.processing
        console.log(paymentIntentProcessing);

        break;
      case "payment_intent.requires_action":
        const paymentIntentRequiresAction = event.data.object;
        // Then define and call a function to handle the event payment_intent.requires_action
        console.log(paymentIntentRequiresAction);

        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        // Then define and call a function to handle the event payment_intent.succeeded
        console.log(paymentIntentSucceeded);
    }

    return;
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal server error",
      success: false,
    });
  }
};
