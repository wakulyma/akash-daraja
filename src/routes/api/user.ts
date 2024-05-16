import { Router, json } from "express";
import { check } from "express-validator";
import { login, signUp } from "../../controllers/userAuth";
import { validateRequest } from "../../middlewares/validate-request";
import { validateToken } from "../../middlewares/auth";
import { deposit } from "../../services/payments/paystack";
import { stripeDeposits } from "../../services/payments/stripe";

const router = Router();

router.post(
  "/signup",
  validateRequest,
  [
    check("phone_number", "Phone Number is required").not().isEmpty().trim(),
    check("password")
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
      })
      .withMessage(
        "Password length must be greater than 6 and contain at least one lowercase letter, one uppercase letter and one number"
      ),
    check("username", "Username is required")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .custom((value) => {
        // ensure that username contains only letters and numbers
        if (!/^[a-zA-Z0-9]+$/.test(value)) {
          throw new Error("Username must contain only letters and numbers");
        }
        return true;
      }),
    check("email")
      .isEmail()
      .withMessage("Email format is invalid")
      .normalizeEmail(),
  ],
  signUp
);

router.post(
  "/login",
  json(),
  validateRequest,
  [
    check("email", "Email is required").not().isEmpty(),
    check("password", "Password is required").not().isEmpty(),
  ],
  login
);

router.post("/deposit", json(), validateToken, validateRequest, stripeDeposits);

module.exports = router;
