import { validateNumber } from "./number.js";

export const sleep = (secs?: number) =>
  new Promise((res) => {
    const timer = Math.round(validateNumber(secs, { defaultValue: 0 }) * 1000);
    setTimeout(() => {
      res(true);
    }, timer);
  });
