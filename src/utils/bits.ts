import { format } from "util";

const units = ["b", "k", "m", "g"] as const;

export function convertBitsToUnit(
  bits: number,
  toUnit: (typeof units)[number] = "b"
) {
  try {
    if (
      typeof bits !== "number" ||
      Number.isNaN(bits) ||
      !Number.isFinite(bits) ||
      bits < 0
    ) {
      throw new Error(`Bits must be a number > 0`);
    }
    if (typeof toUnit !== "string" || !units.includes(toUnit)) {
      throw new Error(format("Unit must be one-of", units));
    }
    let converted = bits;
    if (toUnit === "k") {
      converted = bits / 1000;
    } else if (toUnit === "m") {
      converted = bits / (1000 * 1000);
    } else if (toUnit === "g") {
      converted = bits / (1000 * 1000 * 1000);
    }
    const data = {
      metric: converted,
      original: bits,
      unit: toUnit,
    };
    return data;
  } catch (err) {
    console.error("Error converting bits : ", err);
    return null;
  }
}
