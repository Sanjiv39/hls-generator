import { writeFileSync, readFileSync } from "fs";
import { isPresetValid } from "../utils/presets.js";
import {
  Device,
  VideoCodec,
  videoCodecs,
  devices,
} from "../types/config-types.js";
const { default: oldPresetsData } = await import("../../data/presets.json");

// @ts-ignore
const presetsData: {
  [K in Device]?: {
    codec: VideoCodec<K>;
    presets?: string[];
    defaultPreset?: string;
    option?: string;
  }[];
} = { ...oldPresetsData };

for (let i = 0; i < devices.length; i++) {
  const device = devices[i];
  console.log("Testing for device :", device);
  const codecs = videoCodecs[device];
  console.log("Codecs :[", codecs, "]");
  presetsData[device] = [];
  for (let j = 0; j < codecs.length; j++) {
    const codec = codecs[j];
    const data = await isPresetValid(codec, "");
    if (!data) {
      continue;
    }
    const presetData: Required<typeof presetsData>[Device][0] = {
      codec: codec,
      presets: [
        ...new Set(
          // @ts-ignore
          [...data?.presets, data?.defaultPreset].filter((s) => s?.trim())
        ),
      ],
      defaultPreset: data?.defaultPreset,
      option: data?.option,
    };
    // @ts-ignore
    presetData.defaultPreset?.length && presetsData[device].push(presetData);
    console.log("Response for codec [", codec, "]", {
      default: data?.defaultPreset,
      preset: data?.preset,
    });
  }
  // @ts-ignore
  // console.log(await isPresetValid("h264_vaapi", ""));
  //   console.log(presetsData);
}
console.log(presetsData);
writeFileSync("./data/presets.json", JSON.stringify(presetsData, null, 2));
