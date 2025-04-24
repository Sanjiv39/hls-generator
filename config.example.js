/** @typedef {import("./types/config-types.js").Config} Config */

/** @type {Partial<Config>} */
export const config = {
  input: "file.mkv",
  inputAbsolute: false,
  outputDir: "out",
  hlsChunkTime: 10,
  encodingDevice: "intel",
  decodingDevice: "intel",
  preset: "fast",
  crf: 30,
  hlsMasterFile: "",
  segment: "",
  videoSegment: "",
  audioSegment: "",
  videoSingleM3u8: "",
  audioSingleM3u8: "",
  varianceFolderName: "",
  videoMappings: null,
  audioMappings: null,
};
