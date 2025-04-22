import { FfprobeStream, FfprobeData } from "fluent-ffmpeg";

export type FfMetaData = FfprobeData &
  Partial<{
    videos: (FfprobeStream & { codec_type: "video" })[];
    audios: (FfprobeStream & { codec_type: "audio" })[];
    subtitles: (FfprobeStream & { codec_type: "subtitle" })[];
  }>;

export type DeviceType = "nvidia" | "amd" | "intel";
export type FfOptions<D extends DeviceType = "intel"> = {
  preset:
    | (D extends "nvidia"
        ? `p${1 | 2 | 3 | 4 | 5 | 6 | 7}`
        : D extends "intel"
        ? "veryfast" | "fast" | "slow"
        : string)
    | number;
  crf?: D extends "intel" ? number : undefined;
};
