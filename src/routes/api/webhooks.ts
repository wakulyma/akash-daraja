import express, { Router, json, raw } from "express";
import { processPaystackDepo } from "../../webhooks/paystack";
import { processStripeEvent } from "../../webhooks/stripe";

const router = Router();

router.post("/paystack", json(), processPaystackDepo);

router.post("/stripe", raw({ type: "application/json" }), processStripeEvent);

module.exports = router;
