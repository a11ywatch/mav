import { startGRPC } from "./proto/init";

const initApp = async () => {
  await startGRPC(); // start gRPC instantly. Models may not be loaded yet.
};

initApp();
