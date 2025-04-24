import Ffmpeg, {
  FfmpegCommand,
  FfmpegCommandOptions,
  FfprobeStream,
} from "fluent-ffmpeg";
// utils
import { getFittedResolution, calculateAllBitrates } from "./utils/bitrate.js";
// data
// @ts-ignore
import { config } from "../config.example.js";
const fileMetaData = await import("../metadata.json", {
  assert: { type: "json" },
});
import { FfMetaData, FfOptions } from "./types/ffmpeg.js";
import { getValidPreset } from "./utils/presets.js";
import { getValidAccelerator } from "./utils/accelerator.js";
// @ts-ignore
const metadata: FfMetaData = fileMetaData.default;

// console.log(metadata);

const ffmpeg = Ffmpeg();
const generateOutput = () => {
  try {
    // Videos
    console.log(metadata.videos);
    const videos =
      metadata.videos
        ?.map((dt) => ({
          ...dt,
          resolution: getFittedResolution(Number(String(dt.height))),
          bitrates: calculateAllBitrates(
            Number(String(dt.height)),
            Number(String(dt.bit_rate)) || Number(String(dt.tags?.BPS)) || 0
          ),
        }))
        .filter<
          // @ts-ignore
          Exclude<typeof metadata.videos, undefined>[0] & {
            resolution: Exclude<
              ReturnType<typeof getFittedResolution>,
              null | undefined
            >;
            bitrates: Exclude<
              ReturnType<typeof calculateAllBitrates>,
              null | undefined
            >;
          }
        >(
          // @ts-ignore
          (dt) => !!dt.resolution?.height
          // &&
          // !!dt.bitrates?.[dt.resolution.key]
        ) || [];
    console.log(videos.length);
    const video = videos.sort(
      (a, b) =>
        b.resolution.height * (b.bitrates[b.resolution.key] || 0) -
        a.resolution.height * (a.bitrates[a.resolution.key] || 0)
    )[0];
    console.log("Found", video.resolution, video.bitrates);

    const options: FfOptions<Exclude<typeof config.decodingDevice, undefined>> =
      {
        // decoder settings
        accelerator: getValidAccelerator(
          config.decodingDevice || "none",
          config.accelerator
        ),
        // encoder settings
        preset:
          (config.preset &&
            getValidPreset(config.encodingDevice || "none", config.preset)) ||
          undefined,
        crf:
          (config.decodingDevice === "intel" &&
            typeof config.crf === "number" &&
            !Number.isNaN(config.crf) &&
            Number.isFinite(config.crf) &&
            config.crf > 0 &&
            config.crf) ||
          undefined,
        threads:
          ((config.decodingDevice === "intel" ||
            config.decodingDevice === "amd") &&
            typeof config.threads === "number" &&
            !Number.isNaN(config.threads) &&
            Number.isFinite(config.threads) &&
            config.threads > 0 &&
            config.threads) ||
          undefined,
      };
  } catch (err) {
    console.log(err);
  }
};

generateOutput();
