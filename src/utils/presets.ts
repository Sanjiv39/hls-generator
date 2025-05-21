import {
  AMDPresets,
  Device,
  IntelPresets,
  NvidiaPresets,
  VideoCodec,
} from "../types/config-types.js";
import { cmd } from "./spawn.js";

// @ts-ignore
export const nvidiaPresets: NvidiaPresets[] = Array(7)
  .fill(null)
  .map((_, i) => `p${i + 1}`)
  .concat([
    "slow",
    "medium",
    "fast",
    "default",
    "hq",
    "hp",
    "bd",
    "ll",
    "llhq",
    "llhp",
    "lossless",
    "losslesshp",
  ]);

export const amdPresets: AMDPresets[] = [
  "balanced",
  "quality",
  "speed",
] as const;

export const intelPresets: IntelPresets[] = [
  "veryfast",
  "faster",
  "fast",
  "medium",
  "slow",
  "slower",
  "veryslow",
] as const;

export const devices: Device[] = [
  "amd",
  "intel",
  "nvidia",
  "none",
  "mac",
] as const;

export const getValidPreset = <T extends Device = "none">(
  device = "none" as T,
  preset?: string | number
) => {
  try {
    // @ts-ignore
    device =
      (typeof device === "string" && device.trim().toLowerCase()) || null;
    // @ts-ignore
    preset =
      typeof preset === "number"
        ? preset
        : typeof preset === "string"
        ? (preset || "").toLowerCase().trim()
        : null;
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
    // @ts-ignore
    device = device.trim().toLowerCase();
    if (device === "nvidia") {
      // @ts-ignore
      const valid: NvidiaPresets =
        // @ts-ignore
        typeof preset === "string" && nvidiaPresets.includes(preset)
          ? preset
          : typeof preset === "number" &&
            !Number.isNaN(preset) &&
            Number.isFinite(preset) &&
            preset > 0 &&
            preset <= 7
          ? `p${preset}`
          : "p5";
      return valid;
    }
    if (device === "amd") {
      // @ts-ignore
      const valid: AMDPresets =
        // @ts-ignore
        typeof preset === "string" && amdPresets.includes(preset)
          ? preset
          : "balanced";
      return valid;
    }
    if (device === "intel") {
      // @ts-ignore
      const valid: IntelPresets =
        // @ts-ignore
        typeof preset === "string" && intelPresets.includes(preset)
          ? preset
          : typeof preset === "number" &&
            !Number.isNaN(preset) &&
            Number.isFinite(preset) &&
            preset > 0 &&
            preset <= 10
          ? preset
          : "fast";
      return valid;
    }
    return "fast";
  } catch (err) {
    console.error("Error getting preset :", err);
    return "";
  }
};

export const isPresetValid = async (
  videoCodec: VideoCodec<Device>,
  preset: string
) => {
  try {
    const output = await cmd(`ffmpeg -hide_banner -h encoder="${videoCodec}"`);
    const arr = output
      .split("\n")
      .filter((s) => s.trim())
      .map((s) => s.trim());
    console.log(output);

    const start = arr.findIndex((s) => s.match(/\-preset/));
    const end = arr.findIndex((s, i) => s.match(/\-/) && i > start);
    if (start >= 0 && end >= 0 && end > start) {
      console.log(arr.filter((_, i) => i >= start && i <= end));

      const presets = arr
        .map((s) => s.replace(/ +/g, " "))
        .filter((s, i) => i > start && i < end && s.match(/^(.+) (.+)/))
        .map((s) => s.match(/^(^[ \(\)]+) (.+)/)?.[1] || "")
        .filter((s, i) => s);

      const defaultPreset =
        arr[start].match(/\(default([^()]+)\)/)?.[1]?.trim() || "";
      // console.log(presets, defaultPreset, arr[start]);
      const isValid = presets.includes(preset.trim());

      const data = {
        presets: presets,
        preset: preset.trim() || undefined,
        valid: isValid,
        defaultPreset: defaultPreset,
      };
      return data;
    }
    throw new Error("No preset data");
  } catch (err) {
    return null;
  }
};

// console.log(getValidPreset("intel"));
console.log(await isPresetValid("h264_nvenc", ""));
