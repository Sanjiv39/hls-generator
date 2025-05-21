import {
  Accelerator,
  AMDCodec,
  amdCodecs,
  AudioCodec,
  audioCodecs,
  Device,
  generalVideoCodecs,
  IntelCodec,
  intelCodecs,
  MacCodec,
  macCodecs,
  NvidiaCodec,
  nvidiaCodecs,
  VideoCodec,
  devices,
  allVideoCodecs,
} from "../types/config-types.js";

export const getValidVideoCodec = <D extends Device>(
  device = "none" as D,
  codec?: string
) => {
  try {
    // @ts-ignore
    device =
      (typeof device === "string" && device.trim().toLowerCase()) || null;
    // @ts-ignore
    codec = (typeof codec === "string" && codec.trim().toLowerCase()) || "";
    if (
      !device ||
      // @ts-ignore
      !devices.includes(device.trim().toLowerCase())
    ) {
      throw new Error(
        `Invalid device, required one of [${devices.join(
          ", "
        )}] but got ${device}`,
        { cause: "invalid-device-type" }
      );
    }
    const valid =
      (((device === "nvidia" && nvidiaCodecs.includes(codec as NvidiaCodec)) ||
        (device === "amd" && amdCodecs.includes(codec as AMDCodec)) ||
        (device === "intel" && intelCodecs.includes(codec as IntelCodec)) ||
        (device === "mac" && macCodecs.includes(codec as MacCodec)) ||
        generalVideoCodecs.includes(codec as VideoCodec<"none">)) &&
        (codec as VideoCodec<D>)) ||
      "libx264";
    return valid;
  } catch (err) {
    console.error("Error getting video codec :", err);
    return "libx264";
  }
};

export const validateMatchingCodecs = (codecs?: VideoCodec<Device>[]) => {
  try {
    if (
      !Array.isArray(codecs) ||
      codecs.find(
        (c) =>
          typeof c !== "string" ||
          !c.trim() ||
          !allVideoCodecs.includes(c.trim() as VideoCodec)
      )
    ) {
      throw new Error("Valid Codecs are required");
    }
    if (!codecs.length) {
      return true;
    }
    codecs = codecs.map((c) => c.trim()) as VideoCodec<Device>[];
    const codec = codecs.find((c) => !c.startsWith("libx")) || "";
    if (codec.trim() && codec) {
      const match = codec.endsWith("_amf")
        ? "_amf"
        : codec.endsWith("_nvenc")
        ? "_nvenc"
        : codec.endsWith("_qsv")
        ? "_qsv"
        : "_videotoolbox";
      const dissimilar = codecs
        .filter((c) => !c.startsWith("libx"))
        .find((c) => !c.endsWith(match));
      return !dissimilar;
    }
    return true;
  } catch (err) {
    return false;
  }
};

export const getValidAudioCodec = (codec?: string) => {
  try {
    // @ts-ignore
    codec = (typeof codec === "string" && codec.trim().toLowerCase()) || "";
    const valid =
      (audioCodecs.includes(codec as AudioCodec) && (codec as AudioCodec)) ||
      "aac";
    return valid;
  } catch (err) {
    console.error("Error getting audio codec :", err);
    return "aac";
  }
};
