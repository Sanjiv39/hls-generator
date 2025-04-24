import ffmpeg, { FfprobeData, FfprobeStream } from "fluent-ffmpeg";
import { writeFileSync } from "fs";
import path from "path";
// data
// @ts-ignore
import { config } from "../config.js";
import { calculateAllBitrates, getFittedResolution } from "./utils/bitrate.js";
// types
import { FfMetaData } from "./types/ffmpeg.js";

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
      }))
      .filter((dt) => dt.adaptedResolution?.height);
    // @ts-ignore
    data.audios = data.streams.filter((dt) => dt.codec_type === "audio");
    // @ts-ignore
    data.subtitles = data.streams.filter((dt) => dt.codec_type === "subtitle");
    const str = JSON.stringify(data, null, 2);
    writeFileSync("./metadata.json", str, { encoding: "utf-8" });

    const counts = {
      videos: data.videos?.length,
      audios: data.audios?.length,
      subtitles: data.subtitles?.length,
    };
    console.log("Saved metadata. Found", counts);
    // ffmpeg().outputOptions();
  } catch (err) {
    console.error("Error probing metadata :", err);
  }
});
