import http from "http";
import { config, logServerInit } from "./config";
import { startGRPC } from "./proto/init";
import { aiModels } from "./ai";

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

  // lazy load tensorflow
  if (process.env.DISABLE_TENSORFLOW !== "true") {
    const tf = await import("@tensorflow/tfjs-core");

    if (process.env.NODE_ENV === "production") {
      tf.enableProdMode();
    }

    await import("@tensorflow/tfjs-backend-wasm");
    await tf.setBackend("wasm"); // set tensorflow wasm backend
    await aiModels.initModels();
  }
});
