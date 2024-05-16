import "dotenv/config";
import Stripe from "stripe";

export const config = {
  //MONGO_URI: process.env.MONGO_STRING!,
  MONGO_URI: "mongodb://127.0.0.1:27017/test",

  PAYSTACK_SECRET: process.env.PAYSTACK_SECRET_KEY!,

  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,

  STRIPE_API_KEY: process.env.STRIPE_API_KEY!,

  MSG_BROKER_URL: process.env.MSG_BROKER_URL!,

  PORT: process.env.PORT,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_TOKEN_EXPIRES_IN: 3600000 * 12, //expires in 12hours
};

export const STRIPE = new Stripe(config.STRIPE_API_KEY);

