import { base64Replacer } from "../utils/clean-base64";
import { decodeJpeg } from "../utils/decode";
import type { ImageConfig } from "./config";

// get an image data @return Uint8Array
export const getImage = (config: ImageConfig) => {
  if (!config.img) {
    return null;
  }
  const bufferObject = Buffer.from(base64Replacer(config.img), "base64");
  const arrayBuffer = new ArrayBuffer(bufferObject.length);
  const typedArray = new Uint8Array(arrayBuffer);

  for (var i = 0; i < bufferObject.length; ++i) {
    typedArray[i] = bufferObject[i];
  }

  return decodeJpeg(typedArray);
};
