import ffmpeg, { FfprobeData, FfprobeStream } from "fluent-ffmpeg";
import { writeFileSync } from "fs";
import path from "path";
// data
// @ts-ignore
import { getConfig } from "./utils/config.js";
import { argsToObject } from "./utils/args.js";
import { calculateAllBitrates, getFittedResolution } from "./utils/bitrate.js";
// types
import { FfMetaData } from "./types/ffmpeg.js";
import { ProgressBar } from "./utils/progress.js";
import { convertBitsToUnit } from "./utils/bits.js";

const config = await getConfig();
if (!config) {
  throw new Error(
    "Config not found. Please use a config.js file at the root directory of project similar to [config.example.js]\n************\n"
  );
}

const inputFile = config.inputAbsolute
  ? config.input || ""
  : path.join(import.meta.dirname, config.input || "");

const progressBar = new ProgressBar();

export const main = async () => {
  try {
    await new Promise<boolean>((res, rej) =>
      ffmpeg.ffprobe(inputFile, (err, data: FfMetaData) => {
        if (err) {
          rej(err);
          return;
        }
        const duration =
          (config.useGeneralDuration && data.format.duration) || NaN;
        // @ts-ignore
        data.videos = data.streams
          .filter((dt) => dt.codec_type === "video")
          .map((dt) => ({
            ...dt,
            adaptedResolution: getFittedResolution(Number(String(dt.height))),
            resolutions: calculateAllBitrates(
              Number(String(dt.height)),
              Number(String(dt.bit_rate)) || Number(String(dt.tags?.BPS)) || 0
            ),
            duration: progressBar.getValidTimestampFromMultiple([
              duration,
              dt.duration || "",
              dt.tags?.DURATION || "",
              "",
            ])?.stamp,
          }))
          .filter((dt) => dt.adaptedResolution?.height);
        // @ts-ignore
        data.audios = data.streams
          .map((dt) => ({
            ...dt,
            language: dt.tags?.language?.trim() || dt.language,
            duration: progressBar.getValidTimestampFromMultiple([
              duration,
              dt.duration || "",
              dt.tags?.DURATION || "",
              "",
            ])?.stamp,
          }))
          .filter((dt) => dt.codec_type === "audio");
        // @ts-ignore
        data.subtitles = data.streams
          .map((dt) => ({
            ...dt,
            language: dt.tags?.language?.trim() || dt.language,
            duration: progressBar.getValidTimestampFromMultiple([
              duration,
              dt.duration || "",
              dt.tags?.DURATION || "",
              "",
            ])?.stamp,
          }))
          .filter((dt) => dt.codec_type === "subtitle");

        const str = JSON.stringify(data, null, 2);
        writeFileSync("./metadata.json", str, { encoding: "utf-8" });

        const counts = {
          videos: data.videos?.length,
          audios: data.audios?.length,
          subtitles: data.subtitles?.length,
        };
        console.log("Saved metadata. Found", counts);
        console.log(
          "Duration :",
          progressBar.getValidTimestamp(duration, {
            defaultizeIfInvalid: true,
          })?.stamp
        );
        console.log(
          "Videos: ",
          data.videos?.map((dt) =>
            Object.values(
              Object.fromEntries(
                Object.entries({ ...dt.resolutions }).map((pair) => [
                  pair[0],
                  {
                    ...pair[1],
                    bitrates:
                      (
                        convertBitsToUnit(pair[1].bitrates, "k")?.metric || 0
                      ).toString() + "K",
                  },
                ])
              )
            ).map((val) => ({
              bitrate: val.bitrates,
              quality: `${val.height}p`,
            }))
          )
        );
        console.log(
          "Audios: ",
          data.audios?.map((dt) => ({
            channels: dt.channels,
            language: dt.language || dt.tags?.language,
            duration: dt.duration,
          }))
        );
        console.log(
          "Subtitles: ",
          data.subtitles?.map((dt) => ({
            language: dt.language || dt.tags?.language,
            duration: dt.duration,
          }))
        );
        res(true);
      })
    );
  } catch (err) {
    console.error("Error probing metadata :", err);
  }
};

const args = argsToObject<{ genMeta: string }>(process.argv);
if (Object.hasOwn({ ...args }, "genMeta")) {
  main();
}
