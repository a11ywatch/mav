import { startGRPC } from "./proto/init";

startGRPC().catch((e) => {
  console.error(e);
  process.exit(1);
});
