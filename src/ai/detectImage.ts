import { mobileNetModel, cocoaSDModel } from "./ai-models";
import { getImage } from "./canvas-image";
import type { ClassifyModelType, ImageConfig } from "./config";
import { computerVision } from "./azure-detect-image";
import { chainNextClassifier } from "@app/utils/chain-next";
import { confidentCaptions } from "@app/utils/confidence";

// predict the image based off a HTMLCanvasElement. @returns {class: string, probablity: number }[]
export const predictImage = async (canv) => {
  let predictions = [];
  try {
    predictions = await mobileNetModel?.classify(canv, 1);
    if (chainNextClassifier(predictions)) {
      const cocoaPreds = await cocoaSDModel?.detect(canv); // Retry with cocoa network.
      if (cocoaPreds && cocoaPreds?.length) {
        predictions = cocoaPreds;
      }
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

  let predictions = [];

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

  return {
    className: source?.className || source?.class || source?.text || "",
    probability:
      source?.probability || source?.score || source?.confidence || 0,
  };
};
