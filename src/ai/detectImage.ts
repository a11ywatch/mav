import { mobileNetModel, cocoaSDModel } from "./ai-models";
import { getImage } from "./canvas-image";
import type { ClassifyModelType, ImageConfig } from "./config";
import { computerVision } from "./azure-detect-image";
import { chainNextClassifier } from "@app/utils/chain-next";
import { confidentCaptions } from "@app/utils/confidence";

// predict the image based off a HTMLCanvasElement.
export const predictImage = async (canv: any) => {
  let predictions = [];
  try {
    predictions = await mobileNetModel?.classify(canv as any, 1);
    if (chainNextClassifier(predictions)) {
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
  let predictions = [];
  const cv = await getImage(config).catch((e) => console.error(e));

  if (cv) {
    try {
      predictions = await predictImage(cv);
    } catch (e) {
      console.error(e);
    }
  }

  const runComputerVision = chainNextClassifier(predictions);

  if (runComputerVision) {
    const openCV = await computerVision(config.url, config.img);
    // text description from OCR matched
    if (confidentCaptions(openCV)) {
      predictions = openCV.captions;
    }
  }

  const source = predictions && predictions?.length && predictions[0];

  // always return values - gRPC
  return {
    className: source?.className || source?.class || source?.text || "",
    probability:
      source?.probability || source?.score || source?.confidence || 0,
  };
};
