import { Application } from "express";

export const configureRoutes = (app: Application) => {
  app.use("/daraja/api/v1/user", require("./api/user"));

  app.use("/daraja/api/v1/webhooks", require("./api/webhooks"));
};
