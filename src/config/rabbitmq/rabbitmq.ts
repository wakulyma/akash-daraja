import { Connection } from "rabbitmq-client";
import { config } from "../config";

const brokerUrl = config.MSG_BROKER_URL;

export const RabbitMQ = new Connection(brokerUrl);

RabbitMQ.on("error", (err) => {
  console.error("RabbitMQ connection error", err);
});

RabbitMQ.on("connection", () => {
  console.log("RabbitMQ connected ");
  /* initKora_W_Req_Consumer();
  initKora_W_Batch_Consumer();
  initMonnify_W_Req_Consumer();
  initMonnify_W_Batch_Consumer();
  processMonnifyDepoResponses();
  initMonnifyWithdrawalResponseConsumer();
  processSoftSwissBetActions();
  processSoftSwissWinActions();
  processEVMDeposits(); */
});
