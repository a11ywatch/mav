import { Worker, isMainThread, parentPort } from "worker_threads";

if (isMainThread) {
  const keepAlive = Math.max(
    Number(process.env.TENSORFLOW_KEEP_ALIVE_TIMEOUT),
    4000 // TODO: get estimations across platforms.
  );

  let worker;
  let clearWorkerTimer;

  const clearWorker = async () => {
    if (worker) {
      try {
        await worker.terminate();
        worker = null;
      } catch (e) {
        console.error(e);
      }
    }
  };

  module.exports = function predict(base64) {
    return new Promise((res, rej) => {
      if (clearWorkerTimer) {
        clearTimeout(clearWorkerTimer);
      }

      if (!worker) {
        worker = new Worker(__filename);
      }
      worker.postMessage(base64);

      const cleanUp = () => {
        clearWorkerTimer = setTimeout(clearWorker, keepAlive);
      };

      const resolve = (e) => {
        if (e.tracker === base64) {
          cleanUp();
          res(e.data);
        }
      };

      const reject = (e) => {
        if (e.tracker === base64) {
          cleanUp();
          rej(e.data);
        }
      };

      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0) {
          cleanUp();
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  };
} else {
  const tf = require("@tensorflow/tfjs-core");
  require("@tensorflow/tfjs-backend-wasm");

  const { classify } = require("tensornet");

  if (process.env.NODE_ENV === "production") {
    tf.enableProdMode();
  }

  tf.setBackend("wasm")
    .then(() => {
      parentPort.on("message", (message) => {
        classify(message)
          .then((ds) => {
            parentPort.postMessage({ data: ds, tracker: message });
          })
          .catch((e) => {
            console.error(e);
            parentPort.postMessage({ data: null, tracker: message });
          });
      });
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
