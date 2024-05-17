import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { User } from "../models/User";
import { Password } from "../helpers/password";
import { Wallet } from "../models/Wallet";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

export const signUp = async (req: Request, res: Response) => {
  try {
    const {
      username,
      phone_number,
      email,
      password,
      confirm_password,
      first_name,
      last_name,
      date_of_birth,
      gender,
      city,
      country,
    } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({
        msg: "Passwords do not match",
        success: false,
      });
    }

    if (await User.exists({ username })) {
      return res.status(400).json({
        msg: "Username already exists",
        success: false,
      });
    }
    if (await User.exists({ phone_number })) {
      return res.status(400).json({
        msg: "Phone Number already exists",
        success: false,
      });
    }
    if (await User.exists({ email })) {
      return res.status(400).json({
        msg: "Email already exists",
        success: false,
      });
    }

    //validate password
    const { error } = Password.validate(password);
    if (error) {
      return res.status(400).json({
        msg: error,
        success: false,
      });
    }

    let date = new Date();

    let month = date.getMonth() + 1;

    let day = date.getDate();

    let registered_at = `${date.getUTCFullYear()}-${
      month < 10 ? "0" + month : month
    }-${day < 10 ? "0" + day : day}`;

    //create user:
    const user = await User.create({
      username,
      phone_number,
      email,
      password,
      confirm_password,
      first_name,
      last_name,
      date_of_birth,
      gender,
      city,
      registered_at,
      country,
    });

    //create fiat wallet
    let wallet = await Wallet.create({
      ownerID: user.id,
      currentBalance: 0,
      currency: "USD",
    });

  
    let _user = {
      username: user.username,
      walletBalance: wallet.currentBalance,
    };

    const payload = {
      user: {
        id: user._id,
        
      },
    };
    sign(
      payload,
      config.JWT_SECRET,
      {
        expiresIn: "1h",
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, success: true, _user });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  let { password, email, phone_number } = req.body;

  try {
    let user;

    if (phone_number) {
      if (!(await User.exists({ phone_number }))) {
        // throw error if user does not exist
        return res.status(400).json({
          msg: "User does not exist",
          success: false,
        });
      }
      user = await User.findOne({ phone_number }).select(
        "password phone_number username"
      );
    } else {
      if (!(await User.exists({ email }))) {
        // throw error if user does not exist
        return res.status(400).json({
          msg: "User does not exist",
          success: false,
        });
      }

      user = await User.findOne({ email }).select(
        "password phone_number username"
      );
    }

    if (!user || !(await Password.compare(user.password, password))) {
      return res
        .status(400)
        .json({ msg: "Invalid credentials", success: false });
    }

    let wallet = await Wallet.findOne({ ownerID: user.id });

    let _user = {
      username: user.username,
      walletBalance: wallet?.currentBalance,
    };

    console.log(_user);

    // login user
    const payload = {
      id: user.id,
      phone_number: user.phone_number,
      activeBalance: "NGN", //default will be NGN
    };
    sign(
      payload,
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_TOKEN_EXPIRES_IN,
      },
      (err, token) => {
        if (err) throw err;

        res.json({
          token,
          success: true,
          _user,
        });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send("Internal server error");
  }
};
