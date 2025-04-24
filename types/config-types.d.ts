/**
 * @description Hardware device that can encode or decode
 * @default "none"
 */
export type Device = "nvidia" | "amd" | "intel" | "none";

export type IntelPresets =
  | "veryfast"
  | "faster"
  | "fast"
  | "medium"
  | "slow"
  | "slower"
  | "veryslow"
  | number;

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

export type VideoMapping = {
  name: string;
  bitrate: string | number;
  res: string;
};
export type AudioMapping = {
  name: string;
  bitrate: string | number;
  channels: 1 | 2;
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
   */
  encodingDevice: Device;
  /**
   * @description Processor or graphics card for decoding usage
   * @default "none"
   */
  decodingDevice: Device;
  /**
   * @description Video encoding preset type like fast or good quality
   * @default "fast"
   */
  preset: Presets<D>;
  /**
   * @description CRF speed of device decoding only if it is intel. Otherwise ignores
   * @default undefined
   */
  crf: number | undefined;
  /**
   * @description Number of threads of CPU to be used. Don't pass if GPU
   * @default undefined
   */
  threads: number | undefined;
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
   * @description Variance folder for named variants. (%v refers to variant naem)
   * @default "%v"
   */
  varianceFolderName: string;

  /**
   *  @description Custom video output mappings respective to their resolutions fetched from metadata. Array or null. By default gives mappings of highest resolution till 360p
   * @example [{res: "1280x720p", bitrate: "1200k", name: "HD"}]
   */
  videoMappings: VideoMapping[] | null | undefined;

  /**
   *  @description Custom audio output mappings respective to their indexes fetched from metadata. Array or null. By default gives mappings with indiced names and metadata based settings
   * @example [{name: "eng", bitrate: "192k", channels: 2}]
   */
  audioMappings: AudioMapping[] | null | undefined;
};
