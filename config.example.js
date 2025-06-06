/**
 * Keep this same comment for types also in config.js
 * @typedef {import("./src/types/config-types.js").Config} Config
 */

/** @type {Partial<Config>} */
export const config = {
  input: "file.mkv",
  inputAbsolute: false,
  outputDir: "my-hls",
  hlsChunkTime: 10,
  encodingDevice: "intel",
  decodingDevice: "intel",
  preset: "fast",
  crf: 30,
  threads: 10,
  hlsMasterFile: "",
  segment: "",
  videoSegment: "",
  audioSegment: "",
  videoSingleM3u8: "",
  audioSingleM3u8: "",
  videoMappings: null,
  audioMappings: null,
};
