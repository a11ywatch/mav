import { mobileNetModel, cocoaSDModel } from "./ai-models";
import { chainNextClassifier } from "@app/utils/chain-next";

// predict the image based off a Uint8Array. @returns {class: string, probablity: number }[]
export const predictImage = async (canv) => {
  let predictions = [];

  try {
    predictions = await mobileNetModel?.classify(canv, 1);
    if (chainNextClassifier(predictions)) {
      const cocoaPreds = await cocoaSDModel?.detect(canv); // Retry with cocoa network.
      if (cocoaPreds?.length) {
        predictions = cocoaPreds;
      }
    }
  } catch (e) {
    console.error(e);
  }

  return predictions;
};
