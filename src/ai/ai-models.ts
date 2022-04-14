import * as mobilenet from "@tensorflow-models/mobilenet";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

import {
  CLEAR_MODELS,
  LOADING_MOBILE_NET,
  LOADING_COCOA_SSD,
  LOADED_MODELS,
  LOADING_MODELS,
} from "../static";

const version = 2;
const alpha = 1;

let mobileNetModel;
let cocoaSDModel;

const aiModels = {
  mobileNetModel: null,
  cocoaSDModel: null,
  loadingMobileNet: false,
  loadingCocoaNet: false,
  initMobileNet: async function (retry: number = 0) {
    try {
      if (mobileNetModel) {
        return mobileNetModel;
      } else {
        console.log(LOADING_MOBILE_NET);
        mobileNetModel = await mobilenet.load({ version, alpha });
        return mobileNetModel;
      }
    } catch (e) {
      console.error(e);
      if (retry === 0) {
        await this.initMobileNet(1);
      }
      return null;
    }
  },
  initcocoSSD: async function (retry: number = 0) {
    try {
      if (cocoaSDModel) {
        return cocoaSDModel;
      } else {
        console.log(LOADING_COCOA_SSD);
        cocoaSDModel = await cocoSsd.load({ base: "mobilenet_v2" });
        return cocoaSDModel;
      }
    } catch (e) {
      console.log(e);
      if (retry === 0) {
        await this.initcocoSSD(1);
      }
      return null;
    }
  },
  initModels: async function (bypass?: boolean): Promise<string> {
    if (cocoaSDModel && mobileNetModel && !bypass) {
      console.log(LOADED_MODELS);
      return LOADED_MODELS;
    } else {
      console.log(LOADING_MODELS);
      await Promise.all([this.initcocoSSD(false), this.initMobileNet(false)]);
      return LOADED_MODELS;
    }
  },
  clearModels: function (): string {
    mobileNetModel = null;
    cocoaSDModel = null;
    console.log(CLEAR_MODELS);
    return CLEAR_MODELS;
  },
};

export { aiModels };
