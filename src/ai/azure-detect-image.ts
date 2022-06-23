import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";
import { createReadStream, writeFile, ensureFile, unlink } from "fs-extra";
import type { ComputerVisionModels } from "@azure/cognitiveservices-computervision";
import { base64Replacer } from "tensornet/node_modules/base64-to-tensor";
import { URL } from "url";
import { blacklistUrl } from "../utils/blacklist";
import os from "os";

const tempDir = os.tmpdir() ?? "/tmp";

const LOG_ENABLED = process.env.COMPUTER_VISION_LOG_ENABLED;
const key = process.env.COMPUTER_VISION_SUBSCRIPTION_KEY;
let endpoint = process.env.COMPUTER_VISION_ENDPOINT;

// make sure endpoint is clean
if (endpoint) {
  endpoint = endpoint.trim();
  if (!endpoint.endsWith("/")) {
    endpoint = `${endpoint}/`;
  }
}

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
  return new Promise(async (resolve) => {
    if (!computerVisionClient || (!url && !base64)) {
      return resolve(null);
    }
    let model;

    if (blacklistUrl(url)) {
      try {
        model = await computerVisionClient.describeImage(url, params);
      } catch (e) {
        LOG_ENABLED && console.error(e);
      }
    }

    // retry as local image.
    if (!model && base64) {
      const stripBase64 = base64Replacer(base64);

      // inline file missing alt randomized name
      let baseP = `handwritten_${Math.random()}`;

      try {
        const host = new URL(url);

        if (host) {
          const hs = host.pathname.split("/");
          hs.pop();
          const targetPath = `${host.hostname}${hs[0]}`;
          baseP = `${targetPath}`;
        }
      } catch (e) {
        LOG_ENABLED && console.error(e);
      }

      const handwrittenImagePath = `${tempDir}/a11ywatch_mav/${baseP}.jpg`;

      try {
        await ensureFile(handwrittenImagePath);
        await writeFile(handwrittenImagePath, stripBase64, "base64");
      } catch (e) {
        console.error(e);
      }

      try {
        model = await computerVisionClient.describeImageInStream(
          () => createReadStream(handwrittenImagePath),
          params
        );
      } catch (e) {
        LOG_ENABLED && console.error(e);
      }

      const requiresOcr =
        model &&
        model.tags?.includes("text") &&
        model.captions?.length &&
        model.captions[0].text === "text" &&
        model.captions[0].confidence >= 0.9;

      // retry with ocr text
      if (requiresOcr) {
        try {
          model = await computerVisionClient.recognizePrintedTextInStream(
            true,
            () => createReadStream(handwrittenImagePath)
          );
        } catch (e) {
          LOG_ENABLED && console.error(e);
        }

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
            model = {
              captions: [{ confidence: 1, className: linesOfText.join(" ") }],
            };
          }
        }
      }

      try {
        await unlink(handwrittenImagePath);
      } catch (e) {
        console.error(e);
      }
    }

    resolve(model);
  });
}
