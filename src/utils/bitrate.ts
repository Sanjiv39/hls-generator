const resolutions = {
  x2160: { width: 3840, height: 2160 },
  x1440: { width: 2560, height: 1440 }, // QHD or 2K
  x1080: { width: 1920, height: 1080 }, // Full HD
  x720: { width: 1280, height: 720 }, // HD
  x480: { width: 720, height: 480 }, // Standard Definition (SD)
  x360: { width: 640, height: 360 }, // Lower Definition
  x240: { width: 426, height: 240 }, // Very Low Definition
};
const resolutionsArr = Object.values(resolutions).sort(
  (a, b) => a.width - b.width
);

const resolutionPixels = {
  x2160: 3840 * 2160,
  x1440: 2560 * 1440,
  x1080: 1920 * 1080,
  x720: 921600,
  x480: 410112,
  x360: 230400,
  x240: 102240,
};

export function calculateAllBitrates(
  height: number,
  bitrate?: number,
  options?: Partial<{ resolution: keyof typeof resolutionPixels }>
) {
  try {
    const resolution = getFittedResolution(height);

    if (!resolution?.key) {
      throw new Error("Didn't got any fitting resolution");
    }

    const bitrates: Partial<Record<keyof typeof resolutionPixels, number>> = {};
    const pixels = resolutionPixels[resolution.key];
    bitrate = Math.max(
      bitrate || 0,
      (pixels / resolutionPixels.x1080) * 320000
    );

    for (let res in resolutionPixels) {
      //@ts-ignore
      if ((resolutionPixels[res] as number) > resolution.height) {
        continue;
      }
      //@ts-ignore
      const ratio = resolutionPixels[res] / pixels;
      //@ts-ignore
      bitrates[res] = Math.round(bitrate * ratio);
      //@ts-ignore
      if (!bitrates[res]) {
        // @ts-ignore
        delete bitrate[res];
      }
    }

    return bitrates;
  } catch (err) {
    console.error("Error getting all bitrates :", err);
    return null;
  }
}

export const getFittedResolution = (resolution: number) => {
  try {
    resolution = Number(String(resolution));
    if (!resolution || !Math.max(resolution || 0, 0)) {
      throw new Error(
        `Resolution is invalid. Required >0, received ${resolution}`
      );
    }
    const dims =
      resolutionsArr.find((dims) => dims.height >= resolution) || null;
    if (!dims) {
      throw new Error("No resolution fitted");
    }
    const data = {
      ...dims,
      key: `x${dims.height}` as keyof typeof resolutions,
    };
    return data;
  } catch (err) {
    console.error("Error getting fitting resolution :", err);
    return null;
  }
};

export function getBitrateData(
  bits: number = 0,
  until?: "K" | "M" | "G" | undefined | null
) {
  try {
    if (Number.isNaN(bits)) {
      throw new Error("Required bits as number");
    }
    const units = ["", "K", "M", "G", "T"] as const;
    let i = 0;
    while (bits >= 1000 && i < units.length - 1) {
      bits /= 1000;
      if (until?.toLowerCase().trim() === units[i].toLowerCase()) {
        break;
      }
      i++;
    }
    const data = {
      bits: i ? bits * i * 1000 : bits,
      unit: units[i],
      short: `${Math.round(bits)}${units[i]}`,
    };
    return data;
  } catch (err) {
    return null;
  }
}
