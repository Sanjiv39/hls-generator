"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioCodecs = exports.generalVideoCodecs = exports.macCodecs = exports.intelCodecs = exports.amdCodecs = exports.nvidiaCodecs = exports.generalAccelerators = exports.macAccelerators = exports.intelAccelerators = exports.amdAccelerators = exports.nvidiaAccelerators = void 0;
// Accelerators
exports.nvidiaAccelerators = ["cuda", "cuvid", "nvdec"];
exports.amdAccelerators = ["dxva2"];
exports.intelAccelerators = ["qsv", "vaapi"];
exports.macAccelerators = ["videotoolbox"];
exports.generalAccelerators = [
    "d3d11va",
    "opencl",
    "vulkan",
    "d3d12va",
];
// Codecs
exports.nvidiaCodecs = ["h264_nvenc", "hevc_nvenc", "av1_nvenc"];
exports.amdCodecs = ["h264_amf", "hevc_amf", "av1_amf"];
exports.intelCodecs = ["h264_qsv", "hevc_qsv", "av1_qsv"];
exports.macCodecs = ["h264_videotoolbox", "hevc_videotoolbox"];
exports.generalVideoCodecs = ["libx264", "libx265"];
exports.audioCodecs = ["aac", "mp3", "ac3", "eac3"];
