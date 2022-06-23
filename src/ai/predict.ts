import { Worker, isMainThread, parentPort } from "worker_threads";

if (isMainThread) {
  const tfTimeout = process.env.TENSORFLOW_KEEP_ALIVE_TIMEOUT;
  const defaultTimer =
    process.platform === "linux"
      ? 500
      : process.platform === "win32"
      ? 1000
      : 800;

  // persist the TF models alive between connections [force > 4000]
  const keepAlive = Math.max(
    tfTimeout && !isNaN(Number(tfTimeout))
      ? Number(process.env.TENSORFLOW_KEEP_ALIVE_TIMEOUT)
      : 0,
    defaultTimer
  );

  // batch of workers to track
  const worker = {};
  let clearWorkerTimer;
  let workerIndex = 0; // track workers performing jobs total. [1 worker max 10 messages]
  let workerTracker = 0; // track worker (messages or jobs)

  // the latest worker should pop
  const clearWorker = async () => {
    if (worker[workerIndex]) {
      try {
        await worker[workerIndex].terminate();
        delete worker[workerIndex];
        if (!Object.keys(worker).length) {
          workerIndex = 0; // reset worker workerIndex back to 0
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // remove workers on timeout to allow other request to re-use.
  const cleanUp = () => {
    workerTracker = workerTracker - 1;
    clearWorkerTimer = setTimeout(clearWorker, keepAlive);
  };

  // predict image export
  module.exports = function predict(base64) {
    workerTracker = workerTracker + 1;
    clearWorkerTimer && clearTimeout(clearWorkerTimer);

    // create a new worker max (10 events per)
    if (workerTracker === 10) {
      workerIndex = workerIndex + 1;
    }

    if (!worker[workerIndex]) {
      worker[workerIndex] = new Worker(__filename);
    }

    const cw = worker[workerIndex];

    return new Promise((res, rej) => {
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

      cw.on("message", resolve);
      cw.on("error", reject);
      cw.on("exit", (code) => {
        if (code !== 0) {
          cleanUp();
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });

      cw.postMessage(base64);
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
