import { startGRPC } from "./proto/init";
import "@tensorflow/tfjs-backend-wasm";
import { setBackend, enableProdMode } from "@tensorflow/tfjs-core";

if (process.env.NODE_ENV === "production") {
  enableProdMode();
}

setBackend("wasm")
  .then(startGRPC)
  .catch((e) => {
    console.error(e);
    process.exit(1); // exit if gRPC failed to start.
  });
