import "@tensorflow/tfjs-backend-wasm";
import { startGRPC } from "./proto/init";
import { setBackend, enableProdMode } from "@tensorflow/tfjs-core";

startGRPC()
  .then(() => {
    if (process.env.NODE_ENV === "production") {
      enableProdMode();
    }
    setBackend("wasm");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1); // exit if gRPC failed to start.
  });
