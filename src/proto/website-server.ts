import { Server, ServerCredentials } from "@grpc/grpc-js";
import { getProto } from "./website";
import { detectImageModel } from "@app/ai";
import { GRPC_PORT, GRPC_HOST } from "../config/rpc";

let server: Server;

export const createServer = async () => {
  const websiteProto = await getProto();
  server = new Server();
  server.addService(websiteProto.WebsiteService.service, {
    parseImg: async (call, callback) => {
      const page = await detectImageModel(call.request);
      callback(null, page);
    },
  });
  server.bindAsync(GRPC_HOST, ServerCredentials.createInsecure(), () => {
    server.start();
    console.log(`gRPC server running at http://127.0.0.1:${GRPC_PORT}`);
  });
};

export const killServer = async () => {
  const websiteProto = await getProto();
  server.removeService(websiteProto.WebsiteService.service);
  server.forceShutdown();
};
