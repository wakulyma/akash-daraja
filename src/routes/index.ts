import { Application } from "express";

export const configureRoutes = (app: Application) => {
  app.use("/api/v1/user", require("./api/user"));

  app.use("/api/v1/webhooks", require("./api/webhooks"));
};
