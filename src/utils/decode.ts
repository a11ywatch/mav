import { tensor3d } from "@tensorflow/tfjs-core";
import { decode } from "jpeg-js";

export const decodeJpeg = (contents: Uint8Array, channels: 0 | 1 | 3 = 3) => {
  const { width, height, data } = decode(contents, { useTArray: true });
  const buffer = new Uint8Array(width * height * 3);

  let offset = 0;

  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i] = data[offset];
    buffer[i + 1] = data[offset + 1];
    buffer[i + 2] = data[offset + 2];

    offset += 4;
  }

  return tensor3d(buffer, [height, width, channels]);
};
