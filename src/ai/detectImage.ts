import { mobileNetModel, cocoaSDModel } from "./ai-models";
import { getImage } from "./canvas-image";
import type { ClassifyModelType, ImageConfig } from "./config";
import { computerVision } from "./azure-detect-image";

// predict the image based off a HTMLCanvasElement.
export const predictImage = async (canv: any) => {
  let predictions = [];
  try {
    predictions = await mobileNetModel?.classify(canv as any, 1);
    if (
      (predictions?.length && predictions[0].probability <= 0.45) ||
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
  config: ImageConfig
): Promise<ClassifyModelType> => {
  const cv = await getImage(config).catch((e) => console.error(e));
  let predictions =
    cv && (await predictImage(cv).catch((e) => console.error(e)));
  let source;

  const runComputerVision =
    config.cv &&
    ((predictions && !predictions?.length) ||
      (predictions &&
        predictions?.length &&
        predictions[0].probability <= 0.5));

  if (runComputerVision) {
    const openCV = await computerVision(config.url, config.img);

    if (
      openCV &&
      openCV?.captions?.length &&
      openCV?.captions[0].confidence >= 0.5
    ) {
      predictions = openCV.captions;
    }
  }

  if (predictions && predictions?.length) {
    source = predictions[0]; // Get top prediction.
  }

  // always return values - gRPC
  return {
    className: source?.className || source?.class || source?.text || "",
    probability:
      source?.probability || source?.score || source?.confidence || 0,
  };
};
