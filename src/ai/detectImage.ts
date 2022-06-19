import { computerVision } from "./azure-detect-image";
import { predictImage } from "./network-predict";
import { chainNextClassifier } from "../utils/chain-next";
import { confidentCaptions } from "../utils/confidence";
import type { ClassifyModelType, ImageConfig } from "./config";
import { convert } from "base64-to-tensor";

// Determine the alt tag from a base64 or url
export const detectImageModel = async (
  config: ImageConfig
): Promise<ClassifyModelType> => {
  let tensor = convert(config.img);
  let predictions = [];

  if (tensor) {
    try {
      predictions = await predictImage(tensor);
      tensor.dispose();
    } catch (e) {
      console.error(e);
    }
  }

  const runComputerVision = chainNextClassifier(predictions);

  if (runComputerVision) {
    try {
      const openCV = await computerVision(config.url, config.img);
      // text description from OCR matched
      if (confidentCaptions(openCV)) {
        predictions = openCV.captions;
      }
    } catch (e) {
      console.error(e);
    }
  }

  const source = predictions?.length && predictions[0];

  return {
    className: source?.className || source?.class || source?.text || "",
    probability:
      source?.probability || source?.score || source?.confidence || 0,
  };
};
