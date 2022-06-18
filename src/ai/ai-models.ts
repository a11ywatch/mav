import { load, MobileNet } from "@tensorflow-models/mobilenet";
import {
  load as cocoSsdLoad,
  ObjectDetection,
} from "@tensorflow-models/coco-ssd";

import { CLEAR_MODELS, LOADING_MOBILE_NET, LOADING_COCOA_SSD } from "../static";

let mobileNetModel: MobileNet;
let cocoaSDModel: ObjectDetection;

const aiModels = {
  loadingMobileNet: false,
  loadingCocoaNet: false,
  initMobileNet: async function (retry: number = 0) {
    try {
      console.log(LOADING_MOBILE_NET);
      mobileNetModel = await load({ version: 2, alpha: 1 });
    } catch (e) {
      console.error(e);
      if (retry === 0) {
        await this.initMobileNet(1);
      }
    }
  },
  initcocoSSD: async function (retry: number = 0) {
    try {
      console.log(LOADING_COCOA_SSD);
      cocoaSDModel = await cocoSsdLoad({ base: "mobilenet_v2" });
    } catch (e) {
      console.error(e);
      if (retry === 0) {
        await this.initcocoSSD(1);
      }
    }
  },
  initModels: async function (): Promise<any> {
    await Promise.all([this.initcocoSSD(false), this.initMobileNet(false)]);
  },
  clearModels: function (): string {
    mobileNetModel = null;
    cocoaSDModel = null;
    console.log(CLEAR_MODELS);
    return CLEAR_MODELS;
  },
};

export { aiModels, mobileNetModel, cocoaSDModel };
