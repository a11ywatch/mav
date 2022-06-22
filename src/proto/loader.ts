import { load } from "@grpc/proto-loader";
import { loadPackageDefinition } from "@grpc/grpc-js";
import type {
  GrpcObject,
  Client,
  ServiceClientConstructor,
  ProtobufTypeDefinition,
} from "@grpc/grpc-js";

type GRPC = GrpcObject | ServiceClientConstructor | ProtobufTypeDefinition;

// the generic unwrapping of the gRPC service
type RpcService = typeof Client & {
  service?: any;
};

export interface Service {
  Mav?: RpcService;
  health?: {
    HealthCheck?: RpcService;
  };
}

export const getProto = async (
  target = "/mav.proto"
): Promise<Service & GRPC> => {
  const packageDef = await load(__dirname + target, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return loadPackageDefinition(packageDef);
};
