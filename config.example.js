export const config = {
  input: "file.mkv",
  /**
   * @description The path of input file is absolute or not
   * @default false
   */
  inputAbsolute: false,
  outputDir: "out",
  hlsChunkTime: 10,
  /**
   * @description Processor or graphics card for encoding usage
   * @default "intel"
   * @type {"intel" | "nvidia" | "amd"}
   */
  encodingDevice: "intel",
  /**
   * @description Processor or graphics card for encoding usage
   * @default "intel"
   * @type {"intel" | "nvidia" | "amd"}
   */
  decodingDevice: "intel",
  /**
   * @description Video encoding preset type like fast or good quality
   * @default "veryfast"
   * @type {"veryfast" | "fast" | "slow" | number}
   */
  preset: "",
  /**
   * @description CRF speed of device decoding only if it is intel. Otherwise undefined
   * @default 30
   * @type {number}
   */
  crf: 30,
  /**
   * @description The file that will contain audio, video and subs
   * @default "master.m3u8"
   */
  hlsMasterFile: "",
  /**
   * @description Chunk segment name (%d refers to chunk id). Gets overwritten by videoSegment and audioSegment if exists
   * @default "segment%d.ts"
   */
  segment: "",
  /**
   * @description Video chunk segment name (%d refers to chunk id)
   * @default "segment%d.ts"
   */
  videoSegment: "",
  /**
   * @description Audio chunk segment name (%d refers to chunk id)
   * @default "segment%d.ts"
   */
  audioSegment: "",
  /**
   * @description M3u8 file that holds single video type chunks (like m3u8 for 1080p chunks)
   * @default "index.m3u8"
   */
  videoSingleM3u8: "",
  /**
   * @description M3u8 file that holds single audio type chunks (like m3u8 for eng chunks)
   * @default "index.m3u8"
   */
  audioSingleM3u8: "",
  /**
   * @description Variance folder for named variants. (%v refers to variant naem)
   * @default "%v"
   */
  varianceFolderName: "",

  /**
   *  @description Custom video output mappings respective to their resolutions fetched from metadata. Array or null. By default gives mappings of highest resolution till 360p
   * @type {{res?: string, bitrate?: string, name?: string}[]|null}
   * @example [{res: "1280x720p", bitrate: "1200k", name: "HD"}]
   */
  videoMappings: null,

  /**
   *  @description Custom audio output mappings respective to their indexes fetched from metadata. Array or null. By default gives mappings with indiced names and metadata based settings
   * @type {{name?: string, bitrate?: string, channels?: 1 | 2 }[]|null}
   * @example [{name: "eng", bitrate: "192k", channels: 2}]
   */
  audioMappings: null,
};
