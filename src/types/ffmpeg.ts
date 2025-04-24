import { FfprobeStream, FfprobeData } from "fluent-ffmpeg";
import { Device, Presets } from "../../types/config-types.js";

export type FfmpegTags = Partial<{
  language: string;
  title: string;
  BPS: string;
  DURATION: string;
  NUMBER_OF_FRAMES: string;
  NUMBER_OF_BYTES: string;
  _STATISTICS_WRITING_APP: string;
  _STATISTICS_WRITING_DATE_UTC: string;
  _STATISTICS_TAGS: string;
}>;

export type FfProbeStreamTagged = FfprobeStream & Partial<{ tags: FfmpegTags }>;

export type FfMetaData = {
  [K in keyof FfprobeData]: K extends "streams"
    ? FfProbeStreamTagged[]
    : FfprobeData[K];
} & Partial<{
  videos: (FfProbeStreamTagged & { codec_type: "video" })[];
  audios: (FfProbeStreamTagged & { codec_type: "audio" })[];
  subtitles: (FfProbeStreamTagged & { codec_type: "subtitle" })[];
}>;

export type FfOptions<D extends Device = "none"> = {
  preset: Presets<D> | undefined;
  crf?: D extends "intel" ? number | undefined : undefined;
  threads?: D extends "intel" | "amd" ? number | undefined : undefined;
};
