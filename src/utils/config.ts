import { Config } from "../types/config-types.js";

export const getConfig = async () => {
  try {
    // @ts-ignore
    const { config } = await import("../../config.js");
    return config as Partial<Config>;
  } catch (err) {
    return null;
  }
};
