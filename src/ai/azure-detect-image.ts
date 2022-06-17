import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";
import { createReadStream, writeFileSync, unlinkSync } from "fs";
import type { ComputerVisionModels } from "@azure/cognitiveservices-computervision";

const key = process.env.COMPUTER_VISION_SUBSCRIPTION_KEY;
let endpoint = process.env.COMPUTER_VISION_ENDPOINT;

// make sure endpoint is clean
if (endpoint) {
  if (!endpoint.endsWith("/")) {
    endpoint = `${endpoint}/`;
  }
  endpoint = endpoint.trim();
}

// remove base64 and just get data
const base64Replacer = (base: string) => {
  if (base.startsWith("data:image/png;base64,")) {
    base = base.replace(/^data:image\/png;base64,/, "");
  }
  if (base.startsWith("data:image/jpg;base64,")) {
    base = base.replace(/^data:image\/jpg;base64,/, "");
  }
  if (base.startsWith("data:image/jpeg;base64,")) {
    base = base.replace(/^data:image\/jpg;base64,/, "");
  }
  if (base.startsWith("data:image/tif;base64,")) {
    base = base.replace(/^data:image\/jpg;base64,/, "");
  }
  if (base.startsWith("data:image/svg;base64,")) {
    base = base.replace(/^data:image\/jpg;base64,/, "");
  }
  if (base.startsWith("data:image/gif;base64,")) {
    base = base.replace(/^data:image\/jpg;base64,/, "");
  }
  return base;
};

const computerVisionClient =
  key && endpoint
    ? new ComputerVisionClient(
        new ApiKeyCredentials({
          inHeader: { "Ocp-Apim-Subscription-Key": key.trim() },
        }),
        endpoint
      )
    : null;

const params: ComputerVisionModels.ComputerVisionClientAnalyzeImageOptionalParams = {
  visualFeatures: ["Description"],
};

/**
 * @param url Publicly reachable URL of an image or base64 string.
 */
export function computerVision(
  url: string,
  base64?: string
): Promise<ComputerVisionModels.ImageDescriptionDetails> {
  // exit if api key not found or target
  if (!computerVisionClient || (!url && !base64)) {
    return;
  }

  return new Promise(async (resolve) => {
    let model;
    if (
      url &&
      !url.startsWith("http://localhost") &&
      !url.startsWith("http://127.0.0.1") &&
      !url.startsWith("http://0.0.0.0") &&
      !url.includes(".lan:") // ignore local lan urls
    ) {
      try {
        model = await computerVisionClient.describeImage(url, params);
      } catch (e) {
        console.error(e);
      }
    }

    // retry as local image.
    if (base64 || !model) {
      const stripBase64 = base64Replacer(base64);
      const baseP = url
        ? `/${url.split("/").pop()}`
        : `"\\handwritten_${stripBase64.length}.jpg"`;

      const handwrittenImagePath = __dirname + baseP;

      writeFileSync(handwrittenImagePath, stripBase64, "base64");

      try {
        model = await computerVisionClient.describeImageInStream(
          () => createReadStream(handwrittenImagePath),
          params
        );
      } catch (e) {
        console.error(e);
      }

      const requiresOcr =
        model &&
        model.tags?.includes("text") &&
        model.captions?.length &&
        model.captions[0].text === "text" &&
        model.captions[0].confidence >= 0.9;

      // retry with ocr text
      if (requiresOcr) {
        model = await computerVisionClient.recognizePrintedTextInStream(
          true,
          () => createReadStream(handwrittenImagePath)
        );

        if (model) {
          // build top results to api as one alt
          const linesOfText = [];

          model?.regions?.forEach((region) => {
            region?.lines?.forEach((line) => {
              line?.words?.forEach((word) => {
                if (word.text) {
                  linesOfText.push(word.text);
                }
              });
            });
          });

          if (linesOfText.length) {
            // return as captions
            model = {
              captions: [{ confidence: 1, className: linesOfText.join(" ") }],
            };
          }
        }
      }

      unlinkSync(handwrittenImagePath);
    }

    resolve(model);
  });
}
