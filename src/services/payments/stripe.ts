import { Request, Response } from "express";

import { STRIPE } from "../../config/config";
import { User } from "../../models/User";
import { Deposit } from "../../models/Deposit";

const stripe = STRIPE;

//
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
      success_url: "https://deploy.cloudmos.io/",
      cancel_url: "https://deploy.cloudmos.io/",
      customer_email: userEmail,
    });

    await Deposit.create({
      amount: amount * 10 ** 2, //is stored in cents
      userId: userId,
      timeInitiated: Date.now(),
      paymentGateway: "STRIPE",
      walletAddress: walletAddress,
      referenceId: session.id,
    });

    console.log(`Initiated Chekout Session ${session.id}`);

    return res.status(200).json({ url: session.url, success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error" });
  }
};
