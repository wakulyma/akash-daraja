import crypto from "crypto";
import { config } from "../config/config";
import { Request, Response } from "express";

const secret = config.PAYSTACK_SECRET;

export const processPaystackDepo = async (req: Request, res: Response) => {
  //validate event
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash == req.headers["x-paystack-signature"]) {
    const event = req.body;
    console.log(event);
  }

  return res.send(200);
};
