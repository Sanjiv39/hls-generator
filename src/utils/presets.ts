import {
  AMDPresets,
  Device,
  IntelPresets,
  NvidiaPresets,
} from "../../types/config-types.js";

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

export const devices: Device[] = ["amd", "intel", "nvidia", "none"] as const;

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

// console.log(getValidPreset("intel"));
