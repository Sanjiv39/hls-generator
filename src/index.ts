import ffmpeg, { FfprobeData, FfprobeStream } from "fluent-ffmpeg";
import { writeFileSync } from "fs";
import path from "path";
// data
// @ts-ignore
import { config } from "../config.js";
// types
import { FfMetaData } from "./types/ffmpeg.js";

const inputFile = config.inputAbsolute
  ? config.input
  : path.join(import.meta.dirname, config.input);

ffmpeg.ffprobe(inputFile, (err, data: FfMetaData) => {
  if (err) {
    console.error("Error probing metadata :", err);
    return;
  }
  try {
    // @ts-ignore
    data.videos = data.streams.filter((dt) => dt.codec_type === "video");
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
