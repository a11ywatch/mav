import { getImage } from "./canvas-image";
import type { ClassifyModelType, ImageConfig } from "./config";
import { computerVision } from "./azure-detect-image";
import { chainNextClassifier } from "@app/utils/chain-next";
import { confidentCaptions } from "@app/utils/confidence";
import { predictImage } from "./network-predict";

export const detectImageModel = async (
  config: ImageConfig
): Promise<ClassifyModelType> => {
  let cv;
  let predictions = [];

  try {
    cv = await getImage(config);
  } catch (e) {
    console.error(e);
  }

  try {
    predictions = await predictImage(cv);
  } catch (e) {
    console.error(e);
  }

  const runComputerVision = chainNextClassifier(predictions);

  if (runComputerVision) {
    const openCV = await computerVision(config.url, config.img);
    // text description from OCR matched
    if (confidentCaptions(openCV)) {
      predictions = openCV.captions;
    }
  }

  const source = predictions?.length && predictions[0];

  return {
    className: source?.className || source?.class || source?.text || "",
    probability:
      source?.probability || source?.score || source?.confidence || 0,
  };
};
