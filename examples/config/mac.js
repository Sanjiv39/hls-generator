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
  encodingDevice: "mac",
  decodingDevice: "mac",
  videoCodec: "h264_videotoolbox",
  preset: "-99",
  threads: 10,
};
