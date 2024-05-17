import express from "express";
import { Express } from "express-serve-static-core";

declare global {
  namespace Express {
    export interface Request {
      user: any;
      activeBalance: string;
      stripeBody: any;
    }

    export interface IncominRequest {
      stripeBody: any;
    }
  }
}

declare module "express-serve-static-core" {
  export interface Request {
    user: any;
    activeBalance: string;
  }
}
