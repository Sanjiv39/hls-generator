import { Parser } from "m3u8-parser";
import { readFileSync, writeFileSync } from "fs";

const parser = new Parser();
const m3uFile = readFileSync("./test/master.m3u8", {
  encoding: "utf-8",
});
parser.push(m3uFile);
parser.end();
console.log(parser.manifest);
writeFileSync("./m3u-manifest.json", JSON.stringify(parser.manifest, null, 2), {
  encoding: "utf-8",
});
