import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-wasm";
import express from "express";
import bodyParser from "body-parser";
import { config, logServerInit } from "./config";
import { aiModels, detectImageModel } from "./ai";

const app = express();

app.use(bodyParser.json({ limit: "500mb", extended: true }));

app
  .get("/", (_req, res) => {
    res.json({
      server_status: "online",
    });
  })
  .post("/api/clear", (_req, res, next) => {
    try {
      aiModels.clearModels();
      res.send(true);
    } catch (e) {
      console.log(e, { type: "error" });
      next();
    }
  })
  .post("/api/init", async (_req, res, next) => {
    try {
      await aiModels.initModels();
      res.send(true);
    } catch (e) {
      console.log(e, { type: "error" });
      next();
    }
  })
  .post("/api/parseImg", async (req, res, next) => {
    try {
      if (req.body?.img) {
        const data = await detectImageModel(req.body.img, {
          width: Number(req.body.width),
          height: Number(req.body.height),
        });
        res.json(data);
      } else {
        next();
      }
    } catch (e) {
      console.log(e, { type: "error" });
      next();
    }
  });

const { PORT } = config;

(async () => {
  await tf.setBackend("wasm");
  app.listen(PORT, async () => {
    // set tensorflow backend

    logServerInit(PORT);
  });
})();
