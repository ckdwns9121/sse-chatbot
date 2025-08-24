import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import serverlessExpress from "@vendia/serverless-express";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import { Handler } from "aws-lambda";

let server: Handler;

async function bootstrap(): Promise<Handler> {
  if (!server) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    app.enableCors({
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    });

    await app.init();
    server = serverlessExpress({ app: expressApp });
  }
  return server;
}

export const handler: Handler = async (event, context, callback) => {
  const s = await bootstrap();
  return s(event, context, callback);
};
