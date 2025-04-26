import Ffmpeg, {
  FfmpegCommand,
  FfmpegCommandOptions,
  FfprobeStream,
  getAvailableEncoders,
} from "fluent-ffmpeg";
import path from "path";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { v7 } from "uuid";
import chalkAnimation from "chalk-animation";
// utils
import { getFittedResolution, calculateAllBitrates } from "./utils/bitrate.js";
import { getValidPreset } from "./utils/presets.js";
import { getValidAccelerator } from "./utils/accelerator.js";
import { getValidAudioCodec, getValidVideoCodec } from "./utils/codecs.js";
import { convertBitsToUnit } from "./utils/bits.js";
import { validateNumber } from "./utils/number.js";
// data
// @ts-ignore
import { config } from "../config.js";
let fileMetaData = await import("../metadata.json", {
  assert: { type: "json" },
});
import { FfMetaData, FfOptions } from "./types/ffmpeg.js";
import { Device, Config } from "./types/config-types.js";
import { ProgressBar } from "./utils/progress.js";
import moment from "moment";
// @ts-ignore
let metadata: FfMetaData = fileMetaData.default;

// console.log(metadata);

const uuid = v7();
const inputFile =
  (config.inputAbsolute
    ? config.input
    : path.join(import.meta.dirname, config.input || "")) || "";
const outputFolder = path
  .join(
    config.outputAbsolute ? "" : "out",
    config.outputDir ||
      (config.outputAbsolute
        ? config.outputDir || config.input || `hls-${uuid}`
        : path.join(
            import.meta.dirname,
            config.outputDir || config.input || `hls-${uuid}`
          )) ||
      ""
  )
  .replace("\\", "/");

console.log("Input :", inputFile);
console.log("Output :", outputFolder);
const ffmpegInput = Ffmpeg(inputFile);

const processVideo = async (
  metadata: FfMetaData,
  options: FfOptions<Device>,
  inputOptions: FfOptions<Device>,
  hlsTime: number
) => {
  try {
    // Videos
    // console.log(metadata.videos);
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
    // console.log(videos.length);

    if (!videos.length) {
      throw new Error("No valid videos");
    }

    const video =
      (typeof config.chunkVideoIndex === "number" &&
        !Number.isNaN(config.chunkVideoIndex) &&
        Number.isFinite(config.chunkVideoIndex) &&
        videos.find((dt) => dt.index === config.chunkVideoIndex)) ||
      videos.sort(
        (a, b) =>
          b.resolution.height * (b.bitrates[b.resolution.key]?.bitrates || 0) -
          a.resolution.height * (a.bitrates[a.resolution.key]?.bitrates || 0)
      )[0];
    console.log("Found", video.resolution, video.bitrates);

    const totalDuration =
      ProgressBar.validateTimestamp(video.duration || "")?.parsedTimestamp ||
      "00:00:00";
    const progressBar = new ProgressBar(totalDuration, {
      format:
        "Progress |" +
        "{bar}" +
        `| {percentage}% | ETA: {eta}s || {value}/{total} secs`,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      barCompleteString: "✅",
      barIncompleteString: "🔃",
      hideCursor: true,
      barsize: 80,
    });
    progressBar.start();

    const resolutions = Object.entries(video.bitrates)
      .filter(
        (dt) =>
          !Number.isNaN(dt[1]?.bitrates) &&
          Number.isFinite(dt[1]?.bitrates) &&
          dt[1].bitrates &&
          dt[0]
      )
      .map((dt) => ({ ...(dt[1] as Required<(typeof dt)[1]>) }));

    // default codec
    const vCodec = getValidVideoCodec(config.encodingDevice, config.videoCodec);

    // User video mappings
    const userVMappings: Exclude<
      Config<Device>["videoMappings"],
      null | undefined | false
    > = Array.isArray(config.videoMappings) ? config.videoMappings : [];

    // Video process-----------------------------------------------------
    const outputOptions = Object.entries(options)
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
              `v:${i},name:${userVMappings[i]?.name?.trim() || `${dt.height}p`}`
          )
          .join(" ")}`,
        `-master_pl_name ${
          config.hlsMasterFile?.trim()?.match(/(.| )+[.]m3u8/)?.[0] ||
          "master.m3u8"
        }`,
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
            `-b:v:${i} ${Math.round(
              convertBitsToUnit(
                (userVMappings[i]?.bitrate || dt.bitrates) as number,
                "k"
              )?.metric || 0
            )}k`
        ),
        `-hls_segment_filename ${outputFolder}/video/%v/${
          config.videoSegment || config.segment || "segment%d.ts"
        }`,
      ]);
    await new Promise<boolean>((res, rej) => {
      ffmpegInput
        .inputOptions(
          Object.entries(inputOptions)
            .filter((dt) => dt[1] && dt[0])
            .map((dt) => `-${dt[0]} ${String(dt[1]).trim()}`)
        )
        .outputOptions(outputOptions)
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
          // console.log(
          //   `Video process progress => ${
          //     progress.percent?.toFixed(2) || 0
          //   }%, frames = ${progress.frames}, speed = ${
          //     progress.currentKbps || 0
          //   }kbps - ${progress.currentFps || 0}fps, target = ${
          //     progress.targetSize
          //   }, timestamp = ${progress.timemark}`
          // );
          progressBar.update(progress.timemark);
        })
        .on("end", () => {
          console.log("✅ Done generating video chunks!");
          progressBar.bar?.stop();
          res(true);
        })
        .on("error", (err) => {
          console.error("❌ FFmpeg Error:", err.message);
          rej(err);
        })
        .run();
    });
  } catch (err) {
    console.log("Error processing video :", err);
  }
};

const processAudio = async (
  metadata: FfMetaData,
  options: FfOptions<Device>,
  inputOptions: FfOptions<Device>,
  hlsTime: number
) => {
  try {
    const userIndexes =
      (config.chunkAudioIndexes &&
        [
          ...(Array.isArray(config.chunkAudioIndexes)
            ? config.chunkAudioIndexes
            : [config.chunkAudioIndexes]),
        ].filter(
          (ind) =>
            typeof ind === "number" && Number.isNaN(ind) && Number.isFinite(ind)
        )) ||
      null;
    const audios = (metadata.audios || []).filter((dt) =>
      userIndexes?.length ? userIndexes.includes(dt.index) : true
    );

    const aCodec = getValidAudioCodec(config.audioCodec);
    const userAMappings: Exclude<
      Config<Device>["audioMappings"],
      null | undefined | false
    > = Array.isArray(config.audioMappings) ? config.audioMappings : [];

    if (!audios.length) {
      throw new Error("No valid audios");
    }

    const totalDuration =
      ProgressBar.validateTimestamp(
        // @ts-ignore
        audios
          .filter((dt) => Number(dt.duration))
          .sort((a, b) => Number(b.duration) - Number(a.duration))[0]?.duration
      )?.parsedTimestamp || "00:00:00";
    const progressBar = new ProgressBar(totalDuration, {
      format:
        "Progress |" +
        "{bar}" +
        `| {percentage}% | ETA: {eta}s || {value}/{total} secs`,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      barCompleteString: "✅",
      barIncompleteString: "🔃",
      hideCursor: true,
      barsize: 80,
    });
    progressBar.start();

    const outputOptions = Object.entries(options)
      .filter((dt) => dt[1] && dt[0])
      .map((dt) => `-${dt[0]} ${String(dt[1]).trim()}`)
      .concat([
        // mappings
        ...audios.map((dt) => `-map 0:${dt.index}`),
        "-f",
        "hls",
        `-hls_time`,
        `${hlsTime}`,
        `-hls_playlist_type`,
        `vod`,
        // codecs
        ...audios
          .map((dt, i) => [
            `-c:a:${i}`,
            `${userAMappings[i]?.codec?.trim().toLowerCase() || aCodec}`,
          ])
          .flatMap((dt) => dt),
        // mapping definitions
        "-var_stream_map",
        `${audios
          .map(
            (dt, i) =>
              `a:${i},name:${
                userAMappings[i]?.name?.trim() || `audio_${i + 1}`
              }`
          )
          .join(" ")}`,
        `-master_pl_name`,
        `${
          config.hlsMasterFile?.trim()?.match(/(.| )+[.]m3u8/)?.[0] ||
          "master.m3u8"
        }`,
        // bitrates
        ...audios
          .map((dt, i) => [
            `-b:a:${i}`,
            `${Math.round(
              convertBitsToUnit(
                (userAMappings[i]?.bitrate || dt.bit_rate) as number,
                "k"
              )?.metric || 128
            )}k`,
          ])
          .flatMap((dt) => dt),
        `-hls_segment_filename`,
        `${outputFolder}/audio/%v/${
          config.audioSegment || config.segment || "segment%d.ts"
        }`,
      ]);
    await new Promise<boolean>((res, rej) => {
      ffmpegInput
        .inputOptions(
          Object.entries(inputOptions)
            .filter((dt) => dt[1] && dt[0])
            .map((dt) => `-${dt[0]} ${String(dt[1]).trim()}`)
        )
        .outputOptions(outputOptions)
        .output(
          `${outputFolder}/audio/%v/${
            config.audioSingleM3u8?.trim()?.match(/(.| )+[.]m3u8/)?.[0] ||
            "index.m3u8"
          }`
        )
        .on("start", (commandLine) => {
          console.log("Audio processing started...............");
          console.log("FFmpeg command:", commandLine);
          appendFileSync(
            "./command.sh",
            "\n\nAudio" + Array(50).fill("-").join("") + "\n"
          );
          appendFileSync("./command.sh", commandLine);
        })
        .on("progress", (progress) => {
          progressBar.update(progress.timemark);
        })
        .on("end", () => {
          console.log("✅ Done generating audio chunks!");
          res(true);
        })
        .on("error", (err) => {
          console.error("❌ FFmpeg Error:", err.message);
          rej(err);
        })
        .run();
    });
  } catch (err) {
    console.log("Error processing audio :", err);
  }
};

const processSubtitles = async (
  metadata: FfMetaData,
  options: FfOptions<Device>,
  inputOptions: FfOptions<Device>
) => {
  try {
    const userIndexes =
      (config.chunkSubtitleIndexes &&
        [
          ...(Array.isArray(config.chunkSubtitleIndexes)
            ? config.chunkSubtitleIndexes
            : [config.chunkSubtitleIndexes]),
        ].filter((ind) =>
          validateNumber(ind || 0, {
            defaultValue: 0,
          })
        )) ||
      null;
    const subtitles = (metadata.subtitles || []).filter((dt) =>
      userIndexes?.length ? userIndexes.includes(dt.index) : true
    );

    const codec = "webvtt";
    const skipTime = validateNumber(config.delaySubsBy || 0, {
      defaultValue: 0,
    });
    const userMappings: Exclude<
      Config<Device>["subtitleMappings"],
      null | undefined | false
    > = Array.isArray(config.audioMappings) ? config.audioMappings : [];

    if (!subtitles.length) {
      throw new Error("No valid subtitles");
    }

    if (!existsSync(`${outputFolder}/subs`)) {
      mkdirSync(`${outputFolder}/subs`, { recursive: true });
    }

    const outputOptions = Object.entries(options)
      .filter((dt) => dt[1] && dt[0])
      .map((dt) => `-${dt[0]} ${String(dt[1]).trim()}`)
      .concat([
        // mappings
        ...subtitles.map((dt) => `-map 0:${dt.index}`),
        // codecs
        "-c:s",
        codec,
      ]);

    const subtitlePr = async (
      subtitleData: (typeof subtitles)[number],
      i: number
    ) => {
      try {
        const runner = Ffmpeg();
        const name = userMappings[i]?.name || `sub-${i + 1}`;
        const totalDuration =
          ProgressBar.validateTimestamp(subtitleData.duration || "")
            ?.parsedTimestamp || "00:00:00";
        const progressBar = new ProgressBar(totalDuration, {
          format:
            "Progress |" +
            "{bar}" +
            `| {percentage}% | ETA: {eta}s || {value}/{total} secs`,
          barCompleteChar: "\u2588",
          barIncompleteChar: "\u2591",
          barCompleteString: "✅",
          barIncompleteString: "🔃",
          hideCursor: true,
          barsize: 80,
        });
        progressBar.start();
        await new Promise<boolean>((res, rej) => {
          runner
            .input(inputFile)
            .inputOptions([
              `-itsoffset`,
              String(
                validateNumber(userMappings[i]?.delayBy, { defaultValue: 0 }) ||
                  skipTime
              ),
            ])
            .outputOptions(`-map`, `0:${subtitleData.index}`, "-c:s", codec)
            .output(
              `${outputFolder}/subs/${
                userMappings[i]?.name || `sub-${i + 1}`
              }.vtt`
            );
          runner
            .on("start", (commandLine) => {
              console.log("Name :", name);
              chalkAnimation.glitch("Processing...............").start();
              console.log("FFmpeg command:", commandLine);
              appendFileSync(
                "./command.sh",
                "\n\nSubtitle" + Array(50).fill("-").join("") + "\n"
              );
              appendFileSync("./command.sh", commandLine);
            })
            .on("progress", (progress) => {
              // console.log(
              //   `progress => ${progress.percent?.toFixed(2) || 0}%, frames = ${
              //     progress.frames
              //   }, speed = ${progress.currentKbps || 0}kbps - ${
              //     progress.currentFps || 0
              //   }fps, target = ${progress.targetSize}, timestamp = ${
              //     progress.timemark
              //   }`
              // );
              progressBar.update(progress.timemark);
            })
            .on("end", () => {
              console.log("✅ Generated subtitle", name);
              progressBar.bar?.stop();
              res(true);
            })
            .on("error", (err) => {
              console.error("❌ FFmpeg Error:", err.message);
              rej(err);
            })
            .run();
        });
      } catch (err) {
        console.log("Error subtitle :", err);
      }
    };

    console.log("Starting to process subtitles.....................");
    for (let i = 0; i < subtitles.length; i++) {
      const subData = subtitles[i];
      // Add cloned input with different delay [-itsoffset] as indexed with [i]
      await subtitlePr(subData, i);
    }
    console.log("✅ Finished processing subtitles.....................");
  } catch (err) {
    console.log("Error processing subtitles :", err);
  }
};

const generateOutput = async () => {
  try {
    // Config options input
    const iOptions = {
      // decoder settings
      hwaccel: getValidAccelerator(
        config.decodingDevice || "none",
        config.accelerator
      ),
    };

    // Config options output
    const oOptions: FfOptions<Device> = {
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

    const hlsTime =
      (typeof config.hlsChunkTime === "number" &&
        Number.isFinite(config.hlsChunkTime) &&
        config.hlsChunkTime > 0 &&
        config.hlsChunkTime) ||
      10;

    const doProcess = {
      video: Object.hasOwn(config, "chunkVideo") ? !!config.chunkVideo : true,
      audio: Object.hasOwn(config, "chunkAudio") ? !!config.chunkAudio : true,
      subtitle: Object.hasOwn(config, "chunkSubtitle")
        ? !!config.chunkSubtitle
        : true,
    };

    chalkAnimation.rainbow("S T A R T").start();
    console.log("❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️❇️");
    writeFileSync("./command.sh", "");
    // Video process-----------------------------------------------------
    doProcess.video &&
      (await processVideo(metadata, oOptions, iOptions, hlsTime));

    // Audio process-----------------------------------------------------
    doProcess.audio &&
      (await processAudio(metadata, oOptions, iOptions, hlsTime));

    // Subtitles process-----------------------------------------------------
    doProcess.subtitle &&
      (await processSubtitles(metadata, oOptions, iOptions));
    chalkAnimation
      .karaoke("E N D 🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚🔚")
      .start();
  } catch (err) {
    chalkAnimation.pulse("E R R O R ❌❌❌❌❌❌❌❌❌❌❌❌").start();
    console.log("Error output generation :", err);
  }
};

generateOutput();
