import Ffmpeg, {
  FfmpegCommand,
  FfmpegCommandOptions,
  FfprobeStream,
} from "fluent-ffmpeg";
// utils
import { getFittedResolution, calculateAllBitrates } from "./utils/bitrate.js";
import { getValidPreset } from "./utils/presets.js";
import { getValidAccelerator } from "./utils/accelerator.js";
import { getValidAudioCodec, getValidVideoCodec } from "./utils/codecs.js";
import { Device, Config } from "./types/config-types.js";
// data
// @ts-ignore
import { config } from "../config.js";
const fileMetaData = await import("../metadata.json", {
  assert: { type: "json" },
});
import { FfMetaData, FfOptions } from "./types/ffmpeg.js";
import path from "path";
import { writeFileSync } from "fs";
// @ts-ignore
const metadata: FfMetaData = fileMetaData.default;

// console.log(metadata);

const inputFile =
  (config.inputAbsolute
    ? config.input
    : path.join(import.meta.dirname, config.input || "")) || "";
const outputFolder =
  (config.outputAbsolute
    ? config.input
    : path.join(import.meta.dirname, config.input || "out")) || "";
const ffmpegInput = Ffmpeg(inputFile);

const generateOutput = async () => {
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
    const video =
      (typeof config.chunkVideoIndex === "number" &&
        !Number.isNaN(config.chunkVideoIndex) &&
        videos[config.chunkVideoIndex]) ||
      videos.sort(
        (a, b) =>
          b.resolution.height * (b.bitrates[b.resolution.key]?.bitrates || 0) -
          a.resolution.height * (a.bitrates[a.resolution.key]?.bitrates || 0)
      )[0];
    console.log("Found", video.resolution, video.bitrates);

    const resolutions = Object.entries(video.bitrates)
      .filter(
        (dt) =>
          !Number.isNaN(dt[1]?.bitrates) &&
          Number.isFinite(dt[1]?.bitrates) &&
          dt[1].bitrates &&
          dt[0]
      )
      .map((dt) => ({ ...(dt[1] as Required<(typeof dt)[1]>) }));

    const options: FfOptions<Device> = {
      // decoder settings
      hwaccel: getValidAccelerator(
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
    // default codecs
    const vCodec = getValidVideoCodec(config.encodingDevice, config.videoCodec);
    const aCodec = getValidAudioCodec(config.audioCodec);

    // User video mappings
    const userVMappings: Exclude<
      Config<Device>["videoMappings"],
      null | undefined | false
    > = Array.isArray(config.videoMappings) ? config.videoMappings : [];

    const hlsTime =
      (typeof config.hlsChunkTime === "number" &&
        Number.isFinite(config.hlsChunkTime) &&
        config.hlsChunkTime > 0 &&
        config.hlsChunkTime) ||
      10;

    // Video process
    const videoPr = await new Promise<boolean>((res, rej) => {
      ffmpegInput
        .outputOptions(
          Object.entries(options)
            .filter((dt) => dt[1] && dt[0])
            .map((dt) => `-${dt[0]} ${String(dt[1]).trim()}`)
            .concat([
              // mappings
              ...resolutions.map((dt) => `-map 0:${video.index}`),
              // codecs
              ...resolutions.map(
                (dt, i) =>
                  `-c:v:${i} ${
                    userVMappings[i]?.codec?.trim().toLowerCase() || vCodec
                  }`
              ),
              "-f hls",
              `-hls_time ${hlsTime}`,
              `-hls_playlist_type vod`,
              // mapping definitions
              "-var_stream_map",
              `${resolutions
                .map(
                  (dt, i) =>
                    `v:${i},name:${
                      userVMappings[i]?.name?.trim() || `${dt.height}p`
                    }`
                )
                .join(" ")}`,
              `-master_pl_name "${
                config.hlsMasterFile?.trim()?.match(/(.| )+[.]m3u8/)?.[0] ||
                "master.m3u8"
              }"`,
              // resolutions
              ...resolutions.map(
                (dt, i) =>
                  `-s:v:${i} ${
                    userVMappings[i]?.res?.trim().toLowerCase() ||
                    `${dt.width}x${dt.height}`
                  }`
              ),
              // bitrates
              ...resolutions.map(
                (dt, i) =>
                  `-b:v:${i} ${userVMappings[i]?.bitrate || dt.bitrates}`
              ),
              `-hls_segment_filename ${outputFolder}/video/%v/${
                config.videoSegment || config.segment || "segment%d.ts"
              }`,
            ])
        )
        .output(
          `${outputFolder}/video/%v/${
            config.videoSingleM3u8?.trim()?.match(/(.| )+[.]m3u8/)?.[0] ||
            "index.m3u8"
          }`
        )
        .on("start", (commandLine) => {
          console.log("Video processing started...............");
          console.log("FFmpeg command:", commandLine);
          writeFileSync("./command.sh", commandLine);
        })
        .on("progress", (progress) => {
          console.log(
            `Video process progress => ${
              progress.percent?.toFixed(2) || 0
            }%, frames = ${progress.frames}, speed = ${
              progress.currentKbps
            }kbps - ${progress.currentFps}fps, target = ${
              progress.targetSize
            }, timestamp = ${progress.timemark}`
          );
        })
        .on("end", () => {
          console.log("✅ Done generating video chunks!");
          res(true);
        })
        .on("error", (err) => {
          console.error("❌ FFmpeg Error:", err.message);
          rej(err);
        })
        .run();
    });
  } catch (err) {
    console.log(err);
  }
};

generateOutput();
