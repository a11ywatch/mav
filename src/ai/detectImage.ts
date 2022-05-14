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

  // follow gRPC spec
  if (!canv) {
    return {
      className: "",
      probability: 0,
    };
  }

  let mobileNetModel;
  let cocoaSDModel;

  try {
    mobileNetModel = await aiModels.initMobileNet(1);
  } catch (e) {
    console.error(e);
  }

  try {
    predictions = await mobileNetModel?.classify(canv);
  } catch (e) {
    console.error(e);
  }

  // retry with cocoa network
  if (predictions?.length && predictions[0].probability <= 0.3) {
    try {
      cocoaSDModel = await aiModels.initcocoSSD(1);
    } catch (e) {
      console.error(e);
    }
    try {
      predictions = await cocoaSDModel?.detect(canv);
    } catch (e) {
      console.error(e);
    }
  }

  const predictionsCount = predictions?.length;
  const topPrediction = predictionsCount ? predictions[0] : {};

  // backwards compat api
  const className = topPrediction?.className || topPrediction?.class || "";
  const probability = topPrediction?.probability || topPrediction?.score || 0;

  return {
    className,
    probability,
  };
};
