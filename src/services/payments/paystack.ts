import https from "https";

import { validationResult } from "express-validator";
import { User } from "../../models/User";
import { config } from "../../config/config";
import { Request, Response } from "express";

import { Deposit } from "../../models/Deposit";

const paystackSecret = config.PAYSTACK_SECRET;

export const deposit = async (req: Request, res: Response) => {
  /* if (!errors.isEmpty()) {
    console.log(errors);
    let _errors = errors.array().map((error) => {
      return {
        msg: error.msg,
        field: error.param,
        success: false,
      };
    })[0];
    return res.status(400).json(_errors);
  } */

  let user = req.user?.id;
  let { amount } = req.body;
  try {
    let _data = "";
    let email = "";
    let username = "";
    let data: any;
    let userDetails = await User.findById(user).select(" email");

    if (userDetails) {
      email = userDetails.email;
      username = userDetails.username;
    } else
      throw new Error(`could not fetch user email @deposit: userid${user}`);

    const paystackSecret = config.PAYSTACK_SECRET;

    const params = JSON.stringify({
      email: email,
      amount: JSON.stringify(amount * 100),
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `BEARER ${paystackSecret}`,
        "Content-Type": "application/json",
      },
    };

    const reqPaystack = https
      .request(options, (resPaystack) => {
        resPaystack.on("data", (chunk) => {
          _data += chunk;
        });

        //TODO: add functionality to store the reference codes/ids, and then check these periodically to update status; cron jobs
        resPaystack.on("end", async () => {
          try {
            let dataObj = JSON.parse(_data);
            let url = dataObj.data.authorization_url;
            let referenceId = dataObj.reference;

            await Deposit.create({
              userId: userDetails.id,
              amount: amount,
              paymentGateway: "PAYSTACK",
              referenceId: referenceId,
              currency: "USD",
              time: Date.now(),
            });
            return res.status(200).json(url);
          } catch (err) {
            console.log(err);
            return res.status(500).send("Internal server error");
          }
        });
      })
      .on("error", (error) => {
        throw error;
      });

    reqPaystack.write(params);
    reqPaystack.end();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};
