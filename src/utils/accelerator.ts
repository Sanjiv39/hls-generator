import {
  Accelerator,
  amdAccelerators,
  Device,
  intelAccelerators,
  nvidiaAccelerators,
} from "../types/config-types.js";
import { devices } from "./presets.js";

export const getValidAccelerator = <D extends Device>(
  device = "none" as D,
  accelerator?: string
) => {
  try {
    // @ts-ignore
    device =
      (typeof device === "string" && device.trim().toLowerCase()) || null;
    // @ts-ignore
    accelerator =
      (typeof accelerator === "string" && accelerator.trim().toLowerCase()) ||
      "";
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
      (((device === "nvidia" &&
        // @ts-ignore
        (nvidiaAccelerators as string[]).includes(accelerator)) ||
        (device === "amd" &&
          // @ts-ignore
          (amdAccelerators as string[]).includes(accelerator)) ||
        (device === "intel" &&
          // @ts-ignore
          (intelAccelerators as string[]).includes(accelerator))) &&
        (accelerator as Accelerator<Device>)) ||
      undefined;
    return valid;
  } catch (err) {
    console.error("Error getting accelerator :", err);
    return undefined;
  }
};
