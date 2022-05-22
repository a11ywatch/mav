import { mobileNetModel, cocoaSDModel } from "./ai-models";
import { getImage } from "./canvas-image";
import type { ClassifyModelType, ImageConfig } from "./config";

// predict the image based off a HTMLCanvasElement.
export const predictImage = async (canv: any) => {
  let predictions = [];
  try {
    predictions = await mobileNetModel?.classify(canv as any, 1);
    if (
      (predictions?.length && predictions[0].probability <= 0.3) ||
      !predictions?.length
    ) {
      predictions = await cocoaSDModel?.detect(canv as any); // Retry with cocoa network.
    }
  } catch (e) {
    console.error(e);
  }
  return predictions;
};

export const detectImageModel = async (
  config?: ImageConfig
): Promise<ClassifyModelType> => {
  const cv = await getImage(config).catch((e) => console.error(e));
  const predictions =
    cv && (await predictImage(cv).catch((e) => console.error(e)));

  const source = predictions && predictions?.length ? predictions[0] : {}; // Get top prediction.

  return {
    className: source?.className || source?.class || "",
    probability: source?.probability || source?.score || 0,
  };
};
