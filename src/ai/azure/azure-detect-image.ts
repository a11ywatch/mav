import { createReadStream, writeFile, ensureFile, unlink } from "fs-extra";
import type { ComputerVisionModels } from "@azure/cognitiveservices-computervision";
import { base64Replacer } from "tensornet/node_modules/base64-to-tensor";
import os from "os";
import { blacklistUrl } from "../../utils/blacklist";
import { logError } from "./log";
import { computerVisionClient, params } from "./client";
import { randomFileName } from "./fs";
import { extractText } from "./extract-text";

const tempDir = os.tmpdir() ?? "/tmp";

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

    if (!blacklistUrl(url)) {
      try {
        model = await computerVisionClient.describeImage(url, params);
      } catch (e) {
        logError(e);
      }
    }

    // retry as local image.
    if (!model && base64) {
      const stripBase64 = base64Replacer(base64);
      // inline file missing alt randomized name [TODO: seed]
      const baseP = randomFileName(url);
      const handwrittenImagePath = `${tempDir}/a11ywatch_mav/${baseP}.jpeg`;

      try {
        await ensureFile(handwrittenImagePath);
        await writeFile(handwrittenImagePath, stripBase64, "base64");
      } catch (e) {
        logError(e);
      }

      try {
        model = await computerVisionClient.describeImageInStream(
          () => createReadStream(handwrittenImagePath),
          params
        );
      } catch (e) {
        logError(e);
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
          logError(e);
        }

        if (model) {
          // build top results to api as one alt
          model = extractText(model);
        }
      }

      try {
        await unlink(handwrittenImagePath);
      } catch (e) {
        logError(e);
      }
    }

    resolve(model);
  });
}
