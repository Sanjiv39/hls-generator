import {
  AMDPresets,
  Device,
  IntelPresets,
  NvidiaPresets,
  VideoCodec,
  devices,
  allVideoCodecs,
  videoCodecs,
} from "../types/config-types.js";
import { getValidVideoCodec } from "./codecs.js";
import { validateNumber } from "./number.js";
import { cmd } from "./spawn.js";
const { default: presetsData } = await import("../../data/presets.json");

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

export type PresetTag = "preset" | "quality" | "profile";

const allCodecs = allVideoCodecs;

const validateFromPresetsData = (
  videoCodec: VideoCodec<Device>,
  preset: string
) => {
  try {
    if (
      typeof videoCodec !== "string" ||
      !allVideoCodecs.includes(videoCodec.trim().toLowerCase() as VideoCodec)
    ) {
      throw new Error("Invalid video codec");
    }
    if (typeof preset !== "string") {
      throw new Error("Preset must be a string");
    }
    preset = preset.trim().toLowerCase();
    videoCodec = videoCodec.trim().toLowerCase() as VideoCodec<Device>;

    const arr = Object.values(presetsData).flatMap((d) => d);
    const found =
      arr.find(
        (dt) => dt.codec === videoCodec && dt.presets?.includes(preset)
      ) || null;
    return found;
  } catch (err) {
    return null;
  }
};

export const isPresetValid = async (
  videoCodec: VideoCodec<Device>,
  preset: string
) => {
  try {
    const grepper = process.platform === "win32" ? "findstr" : "grep";

    videoCodec = videoCodec.trim().toLowerCase() as VideoCodec<Device>;
    if (!allCodecs.includes(videoCodec)) {
      throw new Error(`Invalid video codec [${videoCodec}], not supported`);
    }

    if (videoCodec.match(/^libx/)) {
      const data = {
        presets: [],
        preset: undefined,
        valid: false,
        option: "preset" as PresetTag,
        defaultPreset: "fast",
        log: "",
      };
      return data;
    }

    const output = await cmd(`ffmpeg -hide_banner -h encoder="${videoCodec}"`);
    // const output = await cmd(`ffmpeg -hide_banner -encoders | ${grepper} "${videoCodec}"`);
    const arr = output
      .split("\n")
      .filter((s) => s.trim())
      .map((s) => s.trim());
    // console.log(output);

    const startReg = videoCodec.match(/\_amf$/)
      ? /\-quality/
      : videoCodec.match(/\_vaapi$/)
      ? /\-profile/
      : /\-preset/;

    const start = arr.findIndex((s) => s.match(startReg));
    const end = arr.findIndex((s, i) => s.match(/\-/) && i > start);

    if (start >= 0 && end >= 0 && end > start) {
      // console.log(arr.filter((_, i) => i >= start && i <= end));

      const presets = arr
        .map((s) => s.replace(/ +/g, " "))
        .filter((s, i) => i > start && i < end && s.match(/^(.+) (.+)/))
        .map((s) => (s.split(" ")[0] || "").trim())
        .filter((s, i) => s);
      const available = arr
        .filter((s, i) => i >= start && i < end && s.trim().match(/^.+/))
        .map((s, i) => {
          s = s.trim();
          if (i === 0 && s.match(startReg)) {
            s = s + "\n" + Array(s.length).fill("-").join("");
          }
          return s;
        })
        .join("\n");

      const defaultPreset =
        arr[start].match(/\(default([^()]+)\)/)?.[1]?.trim() || "";
      // console.log(presets, defaultPreset, arr[start]);
      const isValid = presets.includes(preset.trim());

      const data = {
        presets: presets,
        preset: preset.trim() || undefined,
        valid: isValid,
        option: (videoCodec.match(/\_amf$/)
          ? "quality"
          : videoCodec.match(/\_vaapi$/)
          ? "profile"
          : "preset") as PresetTag,
        defaultPreset: defaultPreset,
        log: available,
      };
      return data;
    }
    throw new Error("No preset data");
  } catch (err) {
    return null;
  }
};

export const getValidPreset = async <T extends Device = "none">(
  device = "none" as T,
  preset?: (T extends "nvidia" ? number : never) | string,
  codec: VideoCodec<T | "none"> = "libx264"
) => {
  try {
    const data = {
      option: "preset" as PresetTag,
      value: "" as string | undefined,
    };
    // @ts-ignore
    device =
      (typeof device === "string" && device.trim().toLowerCase()) || "none";
    // @ts-ignore
    preset =
      typeof preset === "number"
        ? validateNumber<number | string>(preset, {
            defaultValue: "",
            validateCountable: device === "nvidia",
          })
        : typeof preset === "string" && preset.trim()
        ? preset.toLowerCase().trim()
        : "";
    preset =
      typeof preset === "number" && device === "nvidia" ? `p${preset}` : preset;

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
    codec = getValidVideoCodec(device, codec);

    const existing = validateFromPresetsData(codec, preset as string);
    if (existing?.option) {
      data.option = existing.option as PresetTag;
      data.value = preset as string;
      return;
    }

    const check = await isPresetValid(codec, preset as string);
    data.option = check?.option || "preset";
    data.value =
      (check?.valid && check?.preset) || check?.defaultPreset || undefined;
    if ((!data.value || !check?.valid) && check?.log.trim()) {
      console.log(
        "Preset reference for codec [",
        codec.trim().toLowerCase(),
        "]\n"
      );
      console.log(check.log);
    }
    return data;
  } catch (err) {
    console.error("Error getting preset :", err);
    return null;
  }
};

// console.log(getValidPreset("intel"));
// const data = await getValidPreset("nvidia", "fast", "hevc_nvenc");
// console.log(data);
