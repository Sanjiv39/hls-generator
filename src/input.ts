import ffmpeg, { FfprobeData, FfprobeStream } from "fluent-ffmpeg";
import { writeFileSync } from "fs";
import path from "path";
// data
// @ts-ignore
import { config } from "../config.js";
import { calculateAllBitrates, getFittedResolution } from "./utils/bitrate.js";
import { ProgressBar } from "./utils/progress.js";
// types
import { FfMetaData, FfProbeStreamTagged } from "./types/ffmpeg.js";

const bar = new ProgressBar();

const getDuration = (dt: Partial<FfProbeStreamTagged>) => {
  try {
    let timestamp: string | number =
      String(dt.duration || "")?.trim() ||
      String(dt.tags?.DURATION || "")?.trim();
    const validation = ProgressBar.validateTimestamp(timestamp);
    console.log(
      "Durations for media",
      dt.index,
      dt.duration,
      dt.tags?.DURATION,
      validation
    );
    timestamp = validation.valid
      ? validation.parsedTimestamp
      : timestamp.match(/^[0-9.]+$/)
      ? Number(timestamp) || 0
      : timestamp;
    const time = bar.getValidTimestamp(timestamp, {
      defaultizeIfInvalid: true,
    }).stamp;
    return time;
  } catch (err) {
    console.log("Error get-duration :", err);
    return "00:00:00";
  }
};

const inputFile = config.inputAbsolute
  ? config.input || ""
  : path.join(import.meta.dirname, config.input || "");

ffmpeg.ffprobe(inputFile, (err, data: FfMetaData) => {
  if (err) {
    console.error("Error probing metadata :", err);
    return;
  }
  try {
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
        duration: getDuration(dt),
      }))
      .filter((dt) => dt.adaptedResolution?.height);
    // @ts-ignore
    data.audios = data.streams
      .filter((dt) => dt.codec_type === "audio")
      .map((dt) => ({
        ...dt,
        language: dt.tags?.language?.trim() || dt.language,
        duration: getDuration(dt),
      }));
    // @ts-ignore
    data.subtitles = data.streams
      .filter((dt) => dt.codec_type === "subtitle")
      .map((dt) => ({
        ...dt,
        language: dt.tags?.language?.trim() || dt.language,
        duration: getDuration(dt),
      }));

    const str = JSON.stringify(data, null, 2);
    writeFileSync("./metadata.json", str, { encoding: "utf-8" });

    const counts = {
      videos: data.videos?.length,
      audios: data.audios?.length,
      subtitles: data.subtitles?.length,
    };
    console.log(
      "Video durations :",
      data.videos.map((dt) => ({ ind: dt.index, duration: dt.duration }))
    );
    console.log(
      "Audio durations :",
      data.audios.map((dt) => ({ ind: dt.index, duration: dt.duration }))
    );
    console.log("Saved metadata. Found", counts);
    // ffmpeg().outputOptions();
  } catch (err) {
    console.error("Error probing metadata :", err);
  }
});
