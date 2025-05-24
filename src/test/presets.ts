import { writeFileSync, readFileSync } from "fs";
import { isPresetValid } from "../utils/presets.js";
import {
  Device,
  VideoCodec,
  videoCodecs,
  devices,
} from "../types/config-types.js";
const { default: oldPresetsData } = await import("../../data/presets.json");

type PresetData<D extends Device> = {
  codec: VideoCodec<D>;
  presets: string[];
  defaultPreset: string;
  option: string;
};

// @ts-ignore
const presetsData: {
  [K in Device]?: (Partial<PresetData<K>> & { codec: VideoCodec<K> })[];
} = { ...oldPresetsData };

for (let i = 0; i < devices.length; i++) {
  const device = devices[i];
  console.log("Testing for device :", device);
  const codecs = videoCodecs[device];
  console.log("Codecs :[", codecs, "]");

  if (!presetsData[device]?.length) {
    presetsData[device] = [];
  }

  // @ts-ignore Unify codecs-presets data
  presetsData[device] = presetsData[device]
    ?.reverse()
    // @ts-ignore
    .reduce((prev, curr, i, arr) => {
      if (arr.find((dt, ind) => dt.codec === curr.codec && ind !== i)) {
        return prev;
      }
      return [...prev, curr];
    }, [] as Required<typeof presetsData>[Device]);

  // Loop each codec for a device
  for (let j = 0; j < codecs.length; j++) {
    const codec = codecs[j];

    // Get presets data for a codec
    const data = await isPresetValid(codec, "");
    if (!data) {
      continue;
    }

    const presetData: Required<typeof presetsData>[Device][0] = {
      codec: codec,
      presets: [
        ...new Set(
          [
            ...data?.presets,
            data?.defaultPreset,
            ...(presetsData[device]?.find((dt) => dt.codec === codec)
              ?.presets || []),
          ].filter((s) => s?.trim())
        ),
      ],
      defaultPreset: data?.defaultPreset,
      option: data?.option,
    };

    // Update existing codec data or push new
    // @ts-ignore
    const ind = presetsData[device]?.findIndex((dt) => dt.codec === codec);
    if (typeof ind === "number" && ind >= 0) {
      (presetsData[device] as Required<typeof presetsData>[Device])[
        ind
      ].presets = presetData.presets;
    } else {
      // @ts-ignore
      presetData.presets?.length && presetsData[device]?.push(presetData);
    }
    console.log("Response for codec [", codec, "]", {
      default: data?.defaultPreset,
      preset: data?.preset,
      existingInd: ind,
    });
  }
}
// console.log(presetsData);
writeFileSync("./data/presets.json", JSON.stringify(presetsData, null, 2));

const vaapiCodecs = videoCodecs.intel.map((s) => s.match(/_vaapi/));
// for (let i = 0; i < vaapiCodecs.length; i++) {
//   const codec = vaapiCodecs[i];
//   const data = await isPresetValid(codec as VideoCodec, "");
//   console.log(data);
// }
