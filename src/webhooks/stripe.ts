import { Request, Response } from "express";
import { config } from "../config/config";
import Stripe from "stripe";
import { Deposit } from "../models/Deposit";
import { transferAKT } from "../services/tokenTransfer/akash";

const STRIPE_SECRET = config.STRIPE_API_KEY;

const STRIPE_ENDPOINT_SECRET = config.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(STRIPE_SECRET);

export const processStripeEvent = async (req: Request, res: Response) => {
  try {
    const sig = req.headers["stripe-signature"];

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
        //console.log(checkoutSessionAsyncPaymentFailed);

        break;
      case "checkout.session.async_payment_succeeded":
        const checkoutSessionAsyncPaymentSucceeded = event.data.object;
        // Then define and call a function to handle the event checkout.session.async_payment_succeeded
        //console.log(checkoutSessionAsyncPaymentSucceeded);

        break;
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        // Then define and call a function to handle the event checkout.session.completed
        console.log(
          "Checkout session completed for session id",
          checkoutSessionCompleted.id
        );

        let checkoutSessionDB = await Deposit.findOne({
          referenceId: checkoutSessionCompleted.id,
        });

        if (
          checkoutSessionDB &&
          checkoutSessionDB.referenceId == checkoutSessionCompleted.id
        ) {
          let walletAddress: any =
            checkoutSessionCompleted.metadata?.walletAddress;
          let amount: any = checkoutSessionCompleted?.amount_total;
          //make transfer, and update doc in db
          await transferAKT(walletAddress, amount);

          checkoutSessionDB.processed = true;
          checkoutSessionDB.timeDeposited = Date.now();
          checkoutSessionDB.processingStatus = "COMPLETED_SUCCESSFULLY";

          await checkoutSessionDB.save();
          //
        }

        break;
      case "checkout.session.expired":
        const checkoutSessionExpired = event.data.object;
        // Then define and call a function to handle the event checkout.session.expired
        //console.log(checkoutSessionExpired);

        break;
      case "payment_intent.amount_capturable_updated":
        const paymentIntentAmountCapturableUpdated = event.data.object;
        // Then define and call a function to handle the event payment_intent.amount_capturable_updated
        //console.log(paymentIntentAmountCapturableUpdated);

        break;
      case "payment_intent.canceled":
        const paymentIntentCanceled = event.data.object;
        // Then define and call a function to handle the event payment_intent.canceled
        //console.log(paymentIntentCanceled);

        break;
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object;
        // Then define and call a function to handle the event payment_intent.created
        //console.log(paymentIntentCreated);

        break;
      case "payment_intent.partially_funded":
        const paymentIntentPartiallyFunded = event.data.object;
        // Then define and call a function to handle the event payment_intent.partially_funded
        //console.log(paymentIntentPartiallyFunded);

        break;
      case "payment_intent.payment_failed":
        const paymentIntentPaymentFailed = event.data.object;
        // Then define and call a function to handle the event payment_intent.payment_failed
        //console.log(paymentIntentPaymentFailed);

        break;
      case "payment_intent.processing":
        const paymentIntentProcessing = event.data.object;
        // Then define and call a function to handle the event payment_intent.processing
        //console.log(paymentIntentProcessing);

        break;
      case "payment_intent.requires_action":
        const paymentIntentRequiresAction = event.data.object;
        // Then define and call a function to handle the event payment_intent.requires_action
        //console.log(paymentIntentRequiresAction);

        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      //console.log(paymentIntentSucceeded);
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
