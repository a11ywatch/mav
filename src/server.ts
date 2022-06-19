import { startGRPC } from "./proto/init";

const initApp = async () => {
  await startGRPC(); // start gRPC instantly. Models may not be loaded yet.

  // lazy load tensorflow
  if (process.env.DISABLE_TENSORFLOW !== "true") {
    const tf = await import("@tensorflow/tfjs-core");
    await import("@tensorflow/tfjs-backend-wasm");

    if (process.env.NODE_ENV === "production") {
      tf.enableProdMode();
    }

    await tf.setBackend("wasm"); // set tensorflow wasm backend
  }
};

initApp();
