import { createCanvas, Image } from "canvas";
import type { Canvas } from "canvas";
import type { ImageConfig } from "./config";

export const getImage = (
  config: ImageConfig = { img: "", width: 50, height: 50 }
): Promise<Canvas> => {
  if (!config.img) {
    return Promise.resolve(null);
  }
  const srcWidth = Math.max(Number(config.width), 50);
  const srcHeight = Math.max(Number(config.height), 50);

  const canvas = createCanvas(srcWidth, srcHeight);
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = function () {
      canvas.getContext("2d").drawImage(img, 0, 0, srcWidth, srcHeight);
      resolve(canvas);
    };

    img.onerror = function (err) {
      reject(err);
    };

    img.src = config.img;
  });
};
