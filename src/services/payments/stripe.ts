import { Request, Response } from "express";
import Stripe from "stripe";
import { STRIPE, config } from "../../config/config";
import { User } from "../../models/User";
import { Deposit } from "../../models/Deposit";

const STRIPE_SECRET = config.STRIPE_API_KEY;

const stripe = STRIPE;

export const stripeDeposits = async (req: Request, res: Response) => {
  try {
    let userId = req.user.id;

    let { amount, walletAddress } = req.body;

    if (amount < 3)
      return res.status(301).json({ msg: "minimum allowed deposit is $3" });

    let userDetails = await User.findById(userId);

    let userEmail = userDetails?.email;

    const price_id = "price_1PGbGS09RxW52HKBa2Lh8Dmv";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: price_id,
          quantity: amount,
        },
      ],
      metadata: { walletAddress: walletAddress },
      mode: "payment",
      success_url: "https://google.com",
      cancel_url: "https://youtube.com",
      customer_email: userEmail,
    });

    await Deposit.create({
      amount: amount * 10 ** 2,
      userId: userId,
      timeInitiated: Date.now(),
      paymentGateway: "STRIPE",
      walletAddress: walletAddress,
      referenceId: session.id,
    });

    //emit an event to signal the deposit intent has been created in the db: hashed and store the deposit document onchain; smart contract
    //with key as reference id, and hash as value

    return res.status(200).json({ url: session.url, success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error" });
  }
};
