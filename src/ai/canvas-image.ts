import { createCanvas, Image } from "canvas";
import type { Canvas } from "canvas";

export const getImage = async (
  imageBase64: string,
  config: { width: number; height: number } = { width: 0, height: 0 }
): Promise<Canvas> => {
  if (!imageBase64) {
    return null;
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

      img.src = imageBase64;
    });
  } catch (e) {
    console.error(e);
    return null;
  }
};
