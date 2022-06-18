import { Server, ServerCredentials } from "@grpc/grpc-js";
import { getProto } from "./loader";
import { detectImageModel } from "@app/ai";
import { GRPC_PORT, GRPC_HOST } from "../config/rpc";

let server: Server;

export const createServer = async () => {
  const websiteProto = await getProto();
  const healthProto = await getProto("/health.proto");

  server = new Server();

  server.addService(healthProto.health.HealthCheck.service, {
    check: (_call, callback) => {
      callback(null, { healthy: true });
    },
  });

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
  const healthProto = await getProto("/health.proto");

  server.removeService(websiteProto.WebsiteService.service);
  server.removeService(healthProto.health.HealthCheck.service);

  server.forceShutdown();
};
