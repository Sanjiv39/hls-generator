import { appendFileSync, existsSync } from "fs";
import fs from "fs";
import { spawn } from "child_process";
import { ProgressBar } from "./progress.js";

const progressBar = new ProgressBar(0, {}, {}, { debug: false });

const getStats = (chunk?: Buffer) => {
  try {
    const str = chunk?.toString("utf-8") || "";
    const matched = str
      .trim()
      .match(
        /frame=((.| )*)fps=((.| )*)size=((.| )*)time=((.| )*)bitrate=((.| )*)speed=([0-9.]*)/
      );
    // console.log(matched);

    const stats = {
      time: 0,
      timeStamp: matched?.[7]?.trim() as string,
      speed: Number(matched?.[11]?.trim()),
    };

    const stampData = progressBar?.getValidTimestamp(stats.timeStamp as string);
    stats.timeStamp = stampData?.stamp as string;
    stats.time = stampData?.secs as number;
    if (!stats.timeStamp) {
      throw new Error("Invalid stats");
    }
    return stats;
  } catch (err) {
    return null;
  }
};

export const processFfmpegCmd = async (
  input: string,
  output: string,
  inputOptions?: string[],
  outputOptions?: string[],
  progressBar?: ProgressBar
) => {
  try {
    // Input file validation
    if (
      typeof input !== "string" ||
      !input.trim() ||
      !existsSync(input.trim())
    ) {
      throw new Error("Invalid input file, required string and must exist");
    }
    input = input.trim();
    // Output validation
    if (typeof output !== "string" || !output.trim()) {
      throw new Error("Invalid output file, required string");
    }
    output = output.trim();
    // Options validation
    inputOptions = typeof inputOptions === "undefined" ? [] : inputOptions;
    outputOptions = typeof outputOptions === "undefined" ? [] : outputOptions;
    if (
      !Array.isArray(inputOptions) ||
      inputOptions.find((s) => typeof s !== "string")
    ) {
      throw new Error("Invalid input options, required string array");
    }
    if (
      !Array.isArray(outputOptions) ||
      outputOptions.find((s) => typeof s !== "string")
    ) {
      throw new Error("Invalid output options, required string array");
    }

    await new Promise<boolean>((res, rej) => {
      const cmd = `ffmpeg ${
        inputOptions?.join(" ") || []
      } -i "${input}" -y ${outputOptions?.join(" ")} ${output || ""}`;
      console.log("\nFFmpeg command:", cmd);
      appendFileSync("./command.sh", cmd);

      const spawned = spawn(cmd, { shell: true });
      progressBar?.start();

      // Stdout
      spawned.stdout.on("data", (chunk) => {
        const stats = getStats(chunk);
        stats?.timeStamp && progressBar?.update(stats?.timeStamp);
      });
      spawned.stdout.on("end", () => {
        res(true);
      });
      spawned.stdout.on("error", (err) => {
        rej(err);
      });

      // Stderr
      spawned.stderr.on("data", (chunk) => {
        const stats = getStats(chunk);
        stats?.timeStamp && progressBar?.update(stats?.timeStamp);
      });
      spawned.stderr.on("end", () => {
        res(true);
      });
      spawned.stderr.on("error", (err) => {
        rej(err);
      });

      spawned.on("disconnect", () => {
        rej(new Error("Disconnected process"));
      });
      spawned.on("error", (err) => {
        rej(err);
      });
      spawned.on("close", () => {
        res(true);
      });
    });
    return true;
  } catch (err) {
    throw err;
  } finally {
    try {
      const total = progressBar?.bar?.getTotal() || 0;
      progressBar?.bar?.update(total);
      progressBar?.bar?.stop();
    } catch (err) {}
    console.log("\n\n");
  }
};
