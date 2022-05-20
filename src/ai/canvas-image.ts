import { createCanvas, Image } from "canvas";
import type { Canvas } from "canvas";
import type { ImageConfig } from "./config";

export const getImage = async (
  config: ImageConfig = { imageBase64: "", width: 0, height: 0 }
): Promise<Canvas> => {
  if (!config.imageBase64) {
    return Promise.resolve(null);
  }
  const img = new Image();

  try {
    return await new Promise((resolve) => {
      img.onload = function () {
        const srcWidth = Number(config.width || img.width);
        const srcHeight = Number(config.height || img.width);
        const canvas = createCanvas(srcWidth, srcHeight);

        canvas.getContext("2d").drawImage(img, 0, 0, srcWidth, srcHeight);
        resolve(canvas);
      };

      img.onerror = function () {
        resolve(null);
      };

      img.src = config.imageBase64;
    });
  } catch (e) {
    console.error(e);
  }
};
