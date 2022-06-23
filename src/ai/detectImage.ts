import { computerVision } from "./azure-detect-image";
import { chainNextClassifier } from "../utils/chain-next";
import { confidentCaptions } from "../utils/confidence";
import type { ClassifyModelType, ImageConfig } from "./config";
// @ts-ignore
import predict from "./predict";

// Determine the alt tag from a base64 or url
export const detectImageModel = async (
  config: ImageConfig
): Promise<ClassifyModelType> => {
  let predictions = [];

  try {
    const classification = config.img && (await predict(config.img));

    if (classification && classification?.length) {
      predictions = classification;
    }
  } catch (e) {
    console.error(e);
  }

  const runComputerVision = chainNextClassifier(predictions);

  if (runComputerVision) {
    let openCV;
    try {
      // text description from OCR matched
      openCV = await computerVision(config.url, config.img);
    } catch (e) {
      console.error(e);
    }
    if (openCV && confidentCaptions(openCV)) {
      predictions = openCV.captions;
    }
  }

  const source = predictions?.length && predictions[0];

  return {
    className: source?.className || source?.text || "",
    probability: source?.probability || source?.confidence || 0,
  };
};
