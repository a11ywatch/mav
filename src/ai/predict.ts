import { Worker, isMainThread, parentPort, workerData } from "worker_threads";

if (isMainThread) {
  module.exports = function predict(base64) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: base64,
      });

      worker.once("message", resolve);
      worker.once("error", reject);
      worker.once("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  };
} else {
  const tf = require("@tensorflow/tfjs-core");
  require("@tensorflow/tfjs-backend-wasm");

  if (process.env.NODE_ENV === "production") {
    tf.enableProdMode();
  }

  tf.setBackend("wasm").then(() => {
    const { classify } = require("tensornet");
    let error = false;
    return classify(workerData)
      .then((data) => {
        parentPort.postMessage(data);
      })
      .catch(() => {
        error = true;
      })
      .finally(() => {
        process.exit(error ? 1 : 0);
      });
  });
}
