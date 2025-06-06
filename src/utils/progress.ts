import { SingleBar, MultiBar } from "cli-progress";
import moment from "moment";
import { validateNumber } from "./number.js";

const zeroTimeStamp = "00:00:00";

type Params = {
  /**
   * @description Timestamp in the format `hh:mm:ss`
   * @example  "01:40:56.5636"
   * @default "00:00"
   * */
  totalTimestamp: string;
  /**
   * @description Duration in seconds from `totalTimestamp`. Automatically converted if valid timestamp is passed in `updateTotalTimestamp` and during constructor call. Critical to update
   * @default 0
   */
  totalTime: number;
};

export class ProgressBar {
  bar: SingleBar | null = null;
  timer: NodeJS.Timeout | null = null;
  params: Params = { totalTimestamp: zeroTimeStamp, totalTime: 0 };
  private debug = true;

  static validateTimestamp = (
    timestamp: string,
    options?: Partial<{ debug: boolean }>
  ) => {
    const data = {
      parsedTimestamp: "",
      valid: false,
    };
    try {
      if (typeof timestamp !== "string") {
        throw new Error("Timestamp must be string");
      }
      const match = timestamp.match(
        /^([0-9]{1,2}\:)?([0-9]{1,2}\:)?([0-9]{1,2})(\.[0-9]+)?$/
      ); // hh:mm:ss.S
      if (!match) {
        throw new Error("Timestamp must be something like hh:mm:ss.S");
      }
      let arr = match[0].split(":").map((s) => s.padStart(2, "0"));
      if (arr.length < 3) {
        arr = Array(3 - arr.length)
          .fill("00")
          .concat(arr);
        // arr = arr.fill("00", 0, 3 - arr.length);
      }
      data.parsedTimestamp = arr.join(":");
      data.valid = true;
      return data;
    } catch (err) {
      if (typeof options === "object" && options?.debug) {
        console.error("Error validating timestamp :", err);
      }
      return data;
    }
  };

  /**
   * @description Returns stamp and seconds for passed value if valid.
   * @description Can also default to zero if invalid value by setting option `defaultizeIfInvalid`
   */
  getValidTimestamp = (
    timestamp: string | number,
    options?: Partial<{ defaultizeIfInvalid: boolean }>
  ) => {
    const template = {
      stamp: "",
      secs: 0,
    };
    try {
      if (typeof timestamp === "string") {
        timestamp = timestamp.trim();
        const parsed = ProgressBar.validateTimestamp(timestamp, {
          debug: this.debug,
        });
        if (moment.duration(timestamp).isValid() && parsed.parsedTimestamp) {
          template.stamp = parsed.parsedTimestamp;
          template.secs = moment.duration(timestamp).asSeconds();
          return template;
        }
        if (options?.defaultizeIfInvalid) {
          template.stamp = zeroTimeStamp;
          template.secs = 0;
          return template;
        }
      }
      // Timestamp is seconds
      if (typeof timestamp === "number") {
        if (
          validateNumber<{ isValid: boolean; value: number }>(timestamp, {
            validateCountable: false,
            customValidation: (val) => {
              if (val >= 0) {
                return { isValid: true, value: val };
              }
              return { isValid: false, value: val };
            },
          })?.isValid
        ) {
          const duration = moment.duration(timestamp, "seconds");
          template.stamp = `${duration
            .hours()
            .toString()
            .padStart(2, "0")}:${duration
            .minutes()
            .toString()
            .padStart(2, "0")}:${duration
            .seconds()
            .toString()
            .padStart(2, "0")}`;
          template.secs = moment.duration(timestamp).asSeconds();
          return template;
        }
        if (options?.defaultizeIfInvalid) {
          template.stamp = zeroTimeStamp;
          template.secs = 0;
        }
        return template;
      }
      throw new Error(
        "Invalid value passed, required string in format hh:mm:ss or number >= 0"
      );
    } catch (err) {
      this.debug && console.error("Error getting timestamp :", err);
      return null;
    }
  };

  getValidTimestampFromMultiple = (
    timestamps: (string | number)[],
    options?: Partial<{ defaultizeIfInvalid: boolean }>
  ) => {
    try {
      if (
        !Array.isArray(timestamps) ||
        !timestamps.every((t) => typeof t === "string" || typeof t === "number")
      ) {
        throw new Error("Required array of each either string or number");
      }
      for (let i = 0; i < timestamps.length; i++) {
        const stamp = timestamps[i];
        const data = this.getValidTimestamp(stamp, options);
        if (data) {
          return data;
        }
      }
      throw new Error("No valid timestamp received");
    } catch (err) {
      console.error("Error getting any valid timestamp :", err);
      return null;
    }
  };

  /**
   * @description Updates `totalTimestamp` and `totalTime` if valid.
   * @description Can also default to zero if invalid value by setting option `defaultizeIfInvalid`
   */
  updateTotalTimestamp = (
    timestamp: string | number,
    options?: Partial<{ defaultizeIfInvalid: boolean }>
  ) => {
    try {
      const data = this.getValidTimestamp(timestamp, options);
      if (!data) {
        throw new Error(
          "Invalid value passed, required string in format hh:mm:ss or number >= 0"
        );
      }
      this.params.totalTime = data.secs;
      this.params.totalTimestamp = data.stamp;
    } catch (err) {
      this.debug && console.error("Error updating timestamp :", err);
    }
  };

  constructor(
    totalTimestamp: string | number = 0,
    options?: Partial<ConstructorParameters<typeof SingleBar>[0]>,
    preset?: Partial<ConstructorParameters<typeof SingleBar>[1]>,
    alterOptions?: Partial<{ debug: boolean }>
  ) {
    // @ts-ignore
    this.bar = new SingleBar({ ...options }, { ...preset });
    this.updateTotalTimestamp(totalTimestamp);
    if (
      typeof alterOptions === "object" &&
      Object.hasOwn({ ...alterOptions }, "debug")
    ) {
      this.debug = !!alterOptions.debug as boolean;
    }
  }

  start = (startValue: string | number = 0, payload?: object) => {
    try {
      const startTime = this.getValidTimestamp(startValue, {
        defaultizeIfInvalid: true,
      });
      // console.log(startTime, this.params);
      if (!startTime) {
        throw new Error("Parsing start time failed");
      }
      this.bar?.start(this.params.totalTime, startTime.secs, payload);
    } catch (err) {
      this.debug && console.error("Error starting progress bar :", err);
    }
  };

  update = (progress: string | number) => {
    try {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      const data = this.getValidTimestamp(progress);
      if (!data?.stamp) {
        throw new Error("Error parsing timestamp");
      }
      this.bar?.update(data.secs);
      // this.timer = setTimeout(() => {
      // }, 10);
    } catch (err) {
      this.debug && console.error("Error updating progress :", err);
    }
  };
}

// console.log(ProgressBar.validateTimestamp(""));
