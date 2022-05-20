import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-wasm";
import { config, logServerInit } from "./config";
import http from "http";
import { startGRPC } from "./proto/init";
import { aiModels } from "./ai";
import { CronJob } from "cron";

// TODO: REMOVE for central GRPC HC server
const server = http.createServer(function (req, res) {
  if (
    req.url === "/_internal_/healthcheck" ||
    req.url === "/_internal_/healthcheck/"
  ) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(`{ status: "healthy" }`); // status -> healthy, degraded, offline
    res.end();
  }
});

const { PORT } = config;

server.listen(PORT, async () => {
  logServerInit(PORT);
  await startGRPC(); // start gRPC instantly. Models may not be loaded yet.
  await tf.setBackend("wasm"); // set tensorflow wasm backend
  await aiModels.initModels();

  // sync new models [nightly].
  new CronJob("0 0 * * *", async () => {
    await aiModels.initModels();
  }).start();
});
