/**
 * @description Hardware device that can encode or decode
 * @default "none"
 */
export type Device = "nvidia" | "amd" | "intel" | "mac" | "none";
export const devices: Device[] = ["amd", "intel", "nvidia", "none", "mac"];

// @ts-ignore
type Mutable<T> = T extends readonly (infer U) ? U : T;

// Presets
export type IntelPresets =
  | "veryfast"
  | "faster"
  | "fast"
  | "medium"
  | "slow"
  | "slower"
  | "veryslow";

export type NvidiaPresets =
  | `p${1 | 2 | 3 | 4 | 5 | 6 | 7}`
  | "slow"
  | "medium"
  | "fast"
  | "default"
  | "hp"
  | "hq"
  | "bd"
  | "ll"
  | "llhq"
  | "llhp"
  | "lossless"
  | "losslesshp";
export type AMDPresets = "balanced" | "speed" | "quality";
export type Presets<D extends Device = "none"> = D extends "nvidia"
  ? NvidiaPresets
  : D extends "amd"
  ? AMDPresets
  : IntelPresets;

// Accelerators
export const nvidiaAccelerators = ["cuda", "cuvid", "nvdec"] as const;
export const amdAccelerators = ["dxva2"] as const;
export const intelAccelerators = ["qsv", "vaapi"] as const;
export const macAccelerators = ["videotoolbox"] as const;
export const generalAccelerators = [
  "d3d11va",
  "opencl",
  "vulkan",
  "d3d12va",
] as const;

export type NvidiaAccelerator = (typeof nvidiaAccelerators)[number];
export type AMDAccelerator = (typeof amdAccelerators)[number];
export type IntelAccelerator = (typeof intelAccelerators)[number];
export type MacAccelerator = (typeof macAccelerators)[number];
export type GeneralAccelerator = (typeof generalAccelerators)[number];
export type Accelerator<D extends Device = "none"> =
  | (D extends "nvidia"
      ? NvidiaAccelerator
      : D extends "amd"
      ? AMDAccelerator
      : D extends "mac"
      ? MacAccelerator
      : D extends "intel"
      ? IntelAccelerator
      : GeneralAccelerator)
  | GeneralAccelerator;

// Codecs
export const nvidiaCodecs = ["h264_nvenc", "hevc_nvenc", "av1_nvenc"] as const;
export const amdCodecs = ["h264_amf", "hevc_amf", "av1_amf"] as const;
export const intelCodecs = [
  "h264_qsv",
  "hevc_qsv",
  "av1_qsv",
  "h264_vaapi",
  "hevc_vaapi",
  "av1_vaapi",
] as const;
export const macCodecs = ["h264_videotoolbox", "hevc_videotoolbox"] as const;
export const generalVideoCodecs = ["libx264", "libx265"] as const;
export const allVideoCodecs = [
  ...generalVideoCodecs,
  ...macCodecs,
  ...intelCodecs,
  ...amdCodecs,
  ...nvidiaCodecs,
];
export const videoCodecs = {
  // @ts-ignore
  nvidia: nvidiaCodecs as VideoCodec<"nvidia">[],
  // @ts-ignore
  amd: amdCodecs as VideoCodec<"amd">[],
  // @ts-ignore
  intel: intelCodecs as VideoCodec<"intel">[],
  // @ts-ignore
  mac: macCodecs as VideoCodec<"mac">[],
  // @ts-ignore
  none: generalVideoCodecs as VideoCodec<"none">[],
};

export type NvidiaCodec = (typeof nvidiaCodecs)[number];
export type AMDCodec = (typeof amdCodecs)[number];
export type IntelCodec = (typeof intelCodecs)[number];
export type MacCodec = (typeof macCodecs)[number];

/** @description Encoder Video codec based on encoder-device */
export type VideoCodec<D extends Device = "none"> =
  | (D extends "nvidia"
      ? NvidiaCodec
      : D extends "amd"
      ? AMDCodec
      : D extends "intel"
      ? IntelCodec
      : D extends "mac"
      ? MacCodec
      : never)
  | "libx264"
  | "libx265";

export const audioCodecs = ["aac", "mp3", "ac3", "eac3"] as const;
/** @description Encoder Audio codec */
export type AudioCodec = (typeof audioCodecs)[number];

// Mappings
export type VideoMapping<D extends Device> = {
  name: string;
  /**
   * @description Video bitrate. By default calculated bitrate on the indexed mapping
   * @example 3000000
   * @example "3000k"
   */
  bitrate?: string | number;
  /**
   * @description Video resolution. By default passed by indexed mapping
   * @example "1280x720"
   */
  res?: string;
  /**
   * @description The video codec that will be used for stream
   */
  codec?: VideoCodec<D>;
};
export type AudioMapping = {
  name: string;
  /**
   * @description Audio bitrate. By default calculated bitrate on the indexed mapping
   * @example 128000
   * @example "128k"
   */
  bitrate?: string | number;
  /**
   * @description No of audio channels. 1 for `mono` and 2 for `stereo`
   * @default 1
   */
  channels?: 1 | 2;
  codec?: AudioCodec;
};
export type SubtitleMapping = {
  name?: string;
  delayBy?: number;
};

export type Config<D extends Device = "none"> = {
  /**
   * @description Relative/absolute input video file. Relative to the process directory until set `inputAbsolute` as **true**
   */
  input: string;
  /**
   * @description Relative/absolute output chunk storage directory. Relative to the process directory until set `outputAbsolute` as **true**
   * @default "out"
   */
  outputDir: string;
  /**
   * @description The path of input file is absolute or not
   * @default false
   */
  inputAbsolute: boolean;
  /**
   * @description The path of output directory is absolute or not
   * @default false
   */
  outputAbsolute: boolean;
  /**
   * @description Each chunk segment created for a particular time interval in secs
   * @default 10
   */
  hlsChunkTime: number;
  /**
   * @description Processor or graphics card for encoding usage
   * @default "none"
   */
  encodingDevice: Device;
  /**
   * @description Processor or graphics card for decoding usage
   * @default "none"
   */
  decodingDevice: Device;
  /**
   * @description Video decoding hardware accelerator depending on `decodingDevice`. Please check which one of your supports
   * @default undefined
   */
  accelerator: Accelerator<Device> | undefined;
  /**
   * @description Video encoding preset type depending on quality and speed
   * @default undefined
   */
  preset: string | number | undefined;
  /**
   * @description CRF speed of device decoding only if it is intel. Otherwise ignores
   * @default undefined
   */
  crf: (D extends "intel" ? number : undefined) | undefined;
  /**
   * @description Number of threads of CPU to be used. Don't pass if GPU
   * @default undefined
   */
  threads: (D extends "intel" | "amd" | "mac" ? number : undefined) | undefined;
  /**
   * @description Do chunk video or not if present any
   * @default true
   */
  chunkVideo: boolean;
  /**
   * @description Do chunk audio or not if present any
   * @default true
   */
  chunkAudio: boolean;
  /**
   * @description Do chunk subtitles or not if present any
   * @default true
   */
  chunkSubtitle: boolean;

  /**
   * @description Which video index you want to get chunked from `metadata.json`. Defaults to first highest resolution found with most bitrate.
   * @example 1
   */
  chunkVideoIndex: number;
  /**
   * @description What audio indexes you want to get chunked from `metadata.json`. Defaults to all audios.
   * @example [2, 3]
   * @example 2
   */
  chunkAudioIndexes: number | number[];
  /**
   * @description What subtitle indexes you want to get chunked from `metadata.json`. Defaults to all subtitles.
   * @example [3, 4]
   * @example 3
   */
  chunkSubtitleIndexes: number | number[];

  /**
   * @description Codec will be used for video chunking depending on your encoder device. Please check for supported ones
   * @default "libx264"
   */
  videoCodec: VideoCodec<Device>;
  /**
   * @description Codec will be used for audio chunking
   * @default "aac"
   */
  audioCodec: AudioCodec;

  /**
   * @description The file that will contain audio, video and subs
   * @default "master.m3u8"
   */
  hlsMasterFile: string;

  /**
   * @description Chunk segment name (%d refers to chunk id). Gets overwritten by videoSegment and audioSegment if exists
   * @default "segment%d.ts"
   */
  segment: string;
  /**
   * @description Video chunk segment name (%d refers to chunk id)
   * @default "segment%d.ts"
   */
  videoSegment: string;
  /**
   * @description Audio chunk segment name (%d refers to chunk id)
   * @default "segment%d.ts"
   */
  audioSegment: string;

  /**
   * @description M3u8 file that holds single video type chunks (like m3u8 for 1080p chunks)
   * @default "index.m3u8"
   */
  videoSingleM3u8: string;
  /**
   * @description M3u8 file that holds single audio type chunks (like m3u8 for eng chunks)
   * @default "index.m3u8"
   */
  audioSingleM3u8: string;

  /**
   * @description Seconds to delay subtitle start by. Will get overwritten if specified in `subtitleMappings`.
   * @default 0
   */
  delaySubsBy: number;

  /**
   * @description Whether to use duration if available under `formats`.
   * @default false
   */
  useGeneralDuration: boolean;

  /**
   *  @description Custom video output mappings respective to their resolutions fetched from `metadata.json`. Array or null. By default gives mappings of highest resolution till 360p
   * @example [{res: "1280x720p", bitrate: "1200k", name: "HD"}]
   */
  videoMappings: VideoMapping<Device>[] | null | undefined;
  /**
   *  @description Custom audio output mappings respective to their indexes fetched from `metadata.json`. Array or null. By default gives mappings with indiced names and metadata based settings
   * @example [{name: "eng", bitrate: "192k", channels: 2}]
   */
  audioMappings: AudioMapping[] | null | undefined;
  /**
   *  @description Custom subtitle output mappings respective to their indexes fetched from `metadata.json`. Array or null. By default gives mappings with indiced names and metadata based settings
   * @example [{name: "eng"}]
   */
  subtitleMappings: SubtitleMapping[] | null | undefined;
};
