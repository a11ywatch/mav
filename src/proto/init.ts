import { createServer } from "./website-server";

export const startGRPC = async () => {
  await createServer();
};
