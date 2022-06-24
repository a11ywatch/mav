import { Worker, isMainThread, parentPort } from "worker_threads";

if (isMainThread) {
  const tfTimeout = process.env.TENSORFLOW_KEEP_ALIVE_TIMEOUT;
  const defaultTimer =
    process.platform === "linux"
      ? 500
      : process.platform === "win32"
      ? 700
      : 600;

  // persist the TF models alive between connections [force > 4000]
  const keepAlive = Math.max(
    tfTimeout && !isNaN(Number(tfTimeout))
      ? Number(process.env.TENSORFLOW_KEEP_ALIVE_TIMEOUT)
      : 0,
    defaultTimer
  );

  // batch of workers to track
  const pool: {
    [index: number]: {
      worker?: Worker;
      count: number;
    };
  } = {};
  let clearWorkerTimer;
  let workerIndex = 0; // track workers performing jobs total. [1 worker max 10 messages]

  // the latest worker should pop
  const clearWorker = async () => {
    if (pool[workerIndex]) {
      try {
        await pool[workerIndex].worker.terminate();
        delete pool[workerIndex];
        if (!Object.keys(pool).length) {
          workerIndex = 0; // reset worker workerIndex back to 0
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // remove workers on timeout to allow other request to re-use.
  const cleanUp = () => {
    clearWorkerTimer = setTimeout(clearWorker, keepAlive);
  };

  // predict image export
  module.exports = function predict(base64) {
    clearWorkerTimer && clearTimeout(clearWorkerTimer);

    if (!pool[workerIndex]) {
      pool[workerIndex] = { count: 0 };
      pool[workerIndex].worker = new Worker(__filename);
    }

    pool[workerIndex].count = pool[workerIndex].count + 1;

    const cw = pool[workerIndex].worker;

    const workerID = `${workerIndex}-${pool[workerIndex].count}`;

    // create a new worker max (10 events per)
    if (pool[workerIndex].count === 10) {
      workerIndex = workerIndex + 1;
    }

    return new Promise((res, rej) => {
      const resolve = (e) => {
        if (e.tracker === workerID) {
          cleanUp();
          res(e.data);
        }
      };

      const reject = (e) => {
        if (e.tracker === workerID) {
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

      cw.postMessage({ base64, workerID });
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
        const { base64, workerID } = message;

        classify(base64)
          .then((ds) => {
            parentPort.postMessage({ data: ds, tracker: workerID });
          })
          .catch((e) => {
            console.error(e);
            parentPort.postMessage({ data: null, tracker: workerID });
          });
      });
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
