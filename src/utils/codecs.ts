import {
  Accelerator,
  AMDCodec,
  amdCodecs,
  AudioCodec,
  audioCodecs,
  Device,
  IntelCodec,
  intelCodecs,
  NvidiaCodec,
  nvidiaCodecs,
  VideoCodec,
} from "../types/config-types.js";
import { devices } from "./presets.js";

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
        (device === "intel" && intelCodecs.includes(codec as IntelCodec))) &&
        (codec as VideoCodec<D>)) ||
      "libx264";
    return valid;
  } catch (err) {
    console.error("Error getting video codec :", err);
    return "libx264";
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
