import { aiModels } from "./ai-models";
import { getImage } from "./canvas-image";

interface ClassifyModelType {
  className: string;
  probability: number;
}

export const detectImageModel = async (
  imageBase64: string,
  config: { width: number; height: number } = { width: 0, height: 0 }
): Promise<ClassifyModelType> => {
  // todo look into raw base64 sending
  const canv = await getImage(imageBase64, config);

  let predictions = [];

  if (!canv) {
    return null;
  }

  try {
    const mobileNetModel = await aiModels.initMobileNet(1);

    predictions = await mobileNetModel?.classify(canv);

    if (predictions?.length && predictions[0].probability <= 0.3) {
      const cocoaSDModel = await aiModels.initcocoSSD(1);
      predictions = await cocoaSDModel?.detect(canv);
    }

    const pred = predictions?.length
      ? {
          className: predictions[0].className || predictions[0].class,
          probability: predictions[0].probability || predictions[0].score,
        }
      : { className: "", probability: 0 };

    return pred;
  } catch (e) {
    console.error(e);
    return null;
  }
};
