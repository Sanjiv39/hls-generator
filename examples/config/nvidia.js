/**
 * Types location will change to when you use in config.js in root dir refer to "config.example.js"
 * @typedef {import("../../src/types/config-types.js").Config} Config
 */

/** @type {Partial<Config>} */
export const config = {
  input: "file.mkv",
  inputAbsolute: false,
  outputDir: "my-hls",
  hlsChunkTime: 10,
  encodingDevice: "nvidia",
  decodingDevice: "nvidia",
  preset: "p4",
  hlsMasterFile: "",
  segment: "",
  videoSegment: "",
  audioSegment: "",
  videoSingleM3u8: "",
  audioSingleM3u8: "",
  videoMappings: null,
  audioMappings: null,
};
