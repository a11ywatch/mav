import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-wasm";
import { config, logServerInit } from "./config";
import http from "http";
import { startGRPC } from "./proto/init";

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
  // set tensorflow backend
  await tf.setBackend("wasm");
  await startGRPC();
});
