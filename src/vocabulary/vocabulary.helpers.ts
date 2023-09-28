import { createHash } from "crypto";
import { pick } from "lodash";
import { Settings } from "@prisma/client";
import { WordReqBody } from "./vocabulary.types";

export const generateSoundHash = (settings: Settings, word: WordReqBody) =>
  createHash("sha256")
    .update(
      JSON.stringify({
        ...pick(
          settings,
          "isCustomAudioPreferable",
          "delayPlayerSourceToTarget",
          "delayPlayerWordToWord",
          "sourceVoice",
          "targetVoice",
          "repeatSourceCount",
          "repeatTargetCount",
          "repeatSourceDelay",
          "repeatTargetDelay",
        ),
        ...pick(word.sourceWord, "lang", "text"),
        ...pick(word.targetWord, "lang", "text"),
      }),
    )
    .digest("hex");
