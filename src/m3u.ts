import { Parser, Manifest, Attributes } from "m3u8-parser";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
  WriteFileOptions,
} from "fs";
import Ffmpeg from "fluent-ffmpeg";
import { getLanguage } from "./utils/language";
import {
  getAudioMediaStr,
  getSubtitleMediaStr,
  getVideoStreamStr,
} from "./utils/playlist";
import { exec } from "child_process";

const parser = new Parser();
// const m3uFile = readFileSync("./src/templates/subtitle-index.m3u8", {
//   encoding: "utf-8",
// });
// parser.push(m3uFile);
// parser.end();
// console.log(parser.manifest);
// writeFileSync("./m3u-manifest.json", JSON.stringify(parser.manifest, null, 2), {
//   encoding: "utf-8",
// });

const defaultEncoding = { encoding: "utf-8" } as Partial<WriteFileOptions>;

const probeInput = (input: string) =>
  new Promise<Ffmpeg.FfprobeData>((res, rej) => {
    Ffmpeg.ffprobe(input, (err, data) => {
      if (err) {
        rej(err);
      }
      res(data);
    });
  });

type Attribute = {
  CODECS: string;
  RESOLUTION: Partial<{ width: number; height: number }>;
  BANDWIDTH: number;
};
type VideoSegment = Partial<Attribute> & {
  uri: string;
};
type AudioSegment = {
  uri: string;
};
type SubtitleSegment = {
  uri: string;
};

type ParsedHLSSegments = {
  allowCache: Manifest["allowCache"];
  version: Manifest["version"];
  videos: VideoSegment[];
  audios: AudioSegment[];
  subtitles: SubtitleSegment[];
};

const comment =
  "# You can edit LANGUAGE, NAME, DEFAULT and AUTOSELECT in audios and subtitles ✔️\n# ⚠️ Please don't change other fields if you don't know\n# Above 2 comments can be removed ⬆️";

export const createMasterPl = async (
  dir: string,
  parsedData?: Partial<ParsedHLSSegments>
) => {
  try {
    if (
      typeof dir !== "string" ||
      !dir.trim() ||
      !existsSync(dir.trim()) ||
      !statSync(dir.trim()).isDirectory()
    ) {
      throw new Error("Invalid directory, must exist");
    }
    if (
      !parsedData ||
      typeof parsedData !== "object" ||
      Array.isArray(parsedData)
    ) {
      throw new Error("Parsed data must be valid");
    }
    const videos = parsedData.videos || [];
    const audios = parsedData.audios || [];
    const subtitles = parsedData.subtitles || [];
    // console.log(parsedData);

    let tags = `#EXTM3U\n\n#EXT-X-VERSION:${
      parsedData.version || 3
    }\n#EXT-X-ALLOW-CACHE:${
      (parsedData.allowCache && "YES") || "NO"
    }\n\n${comment}\n`;

    // Audio
    let audioMedia = `# Audios\n`;
    audioMedia += audios
      .map((dt, i) => {
        try {
          const file =
            dt.uri
              .split("/")
              .reverse()[1] || "";
          const lang = getLanguage(file);
          const name = (lang?.language || file).trim().replace(/[-_]/g, " ");

          const str = getAudioMediaStr({
            uri: dt.uri,
            default: !i,
            autoSelect: !i,
            language: (lang?.language && lang.code) || undefined,
            name: name[0].toUpperCase() + name.slice(1).toLowerCase(),
          });
          return str;
        } catch (err) {
          console.log(err);
          return "";
        }
      })
      .filter((s) => s.trim())
      .join("\n");

    // Subs
    let subMedia = `# Subtitles\n`;
    subMedia += subtitles
      .map((dt, i) => {
        try {
          const file =
            dt.uri
              .split("/")
              .reverse()[1] || "";
          const lang = getLanguage(file);
          const name = (lang?.language || file).trim().replace(/[-_]/g, " ");

          const str = getSubtitleMediaStr({
            uri: dt.uri,
            default: !i,
            autoSelect: !i,
            language: (lang?.language && lang.code) || undefined,
            name: name[0].toUpperCase() + name.slice(1).toLowerCase(),
          });
          return str;
        } catch (err) {
          console.log(err);
          return "";
        }
      })
      .filter((s) => s.trim())
      .join("\n");

    // Video
    let videoMedia = `# Streams\n`;
    videoMedia += getVideoStreamStr(
      videos.map((dt) => ({
        uri: dt.uri,
        bandwidth: dt.BANDWIDTH,
        codecs: dt.CODECS,
        resolution: `${dt.RESOLUTION?.width || ""}x${
          dt.RESOLUTION?.height || ""
        }`,
      })),
      { linkAudio: !!audioMedia.trim(), linkSubtitle: !!subMedia.trim() }
    );

    const arr = [tags, audioMedia, subMedia, videoMedia];
    const str = arr.filter((s) => s.trim()).join("\n\n");
    // console.log(arr);

    writeFileSync(`${dir}/master.m3u8`, str);
  } catch (err) {
    console.log("Error creating master playlist :", err);
  }
};

type Options = {
  /** @description The absolute or relative directory that has hls videos, audios and subs */
  dir: string;
  /** @description The relative master file of all video variants inside the `video` folder @default "master.m3u8" */
  videoMaster: string;
  /** @description The relative index files of all audio variants inside the `audio` folder */
  audioIndexes: string[];
  /** @description The relative vtt files of all subtitle variants inside the `subs` folder */
  subtitles: string[];
};
export const parseHLSStreams = async (
  options?: Partial<Options> & { dir: Options["dir"] }
) => {
  try {
    const allOptions = { ...options };
    if (
      typeof allOptions.dir !== "string" ||
      !allOptions.dir.trim() ||
      !existsSync(allOptions.dir.trim()) ||
      !statSync(allOptions.dir.trim()).isDirectory()
    ) {
      throw new Error("Invalid directory, must be string and exist");
    }
    allOptions.dir = allOptions.dir.trim();

    allOptions.audioIndexes = !Array.isArray(allOptions.audioIndexes)
      ? []
      : allOptions.audioIndexes;
    allOptions.subtitles = !Array.isArray(allOptions.subtitles)
      ? []
      : allOptions.subtitles;
    if (
      allOptions.audioIndexes.find((s) => typeof s !== "string" || !s.trim())
    ) {
      throw new Error("Audio index files must be non-empty string[]");
    }
    if (allOptions.subtitles.find((s) => typeof s !== "string" || !s.trim())) {
      throw new Error("Subtitle files must be non-empty string[]");
    }

    const paths = {
      video: `${allOptions.dir}/video`,
      audio: `${allOptions.dir}/audio`,
      subtitle: `${allOptions.dir}/subs`,
    };

    const segments = {
      allowCache: false as Manifest["allowCache"],
      version: undefined as Manifest["version"],
      videos: [] as VideoSegment[],
      audios: [] as AudioSegment[],
      subtitles: [] as SubtitleSegment[],
    };

    // Video
    try {
      const path = `${paths.video}/${allOptions.videoMaster}`;
      const ffdata = await probeInput(path);
      const videoStreams = ffdata.streams.filter(
        (dt) => dt.codec_type === "video"
      );
      const str = readFileSync(path, defaultEncoding) as string;
      parser.push(str);
      parser.end();
      // console.log(
      //   parser.manifest,
      //   parser.manifest.playlists?.map((dt) => dt.attributes)
      // );
      if (parser.manifest.playlists?.length !== videoStreams.length) {
        return;
      }
      segments.allowCache = parser.manifest.allowCache === true;
      segments.version = Number(String(parser.manifest.version)) || undefined;
      for (let i = 0; i < parser.manifest.playlists.length; i++) {
        try {
          const video = parser.manifest.playlists[i] as Manifest & {
            attributes: Attributes & Partial<Attribute>;
            uri?: string;
          };
          const attributes = { ...video.attributes };
          if (video.uri?.trim()) {
            segments.videos.push({ uri: `video/${video.uri}`, ...attributes });
          }
        } catch (err) {}
      }
    } catch (err) {}

    // Audio
    for (let i = 0; i < allOptions.audioIndexes.length; i++) {
      try {
        const audioIndex = allOptions.audioIndexes[i];
        const path = `${paths.audio}/${audioIndex}`;
        const ffdata = await probeInput(path);
        if (ffdata.streams.every((dt) => dt.codec_type === "audio")) {
          segments.audios.push({
            uri: `audio/${audioIndex}`,
          });
        }
      } catch (err) {}
    }

    // Subs
    for (let i = 0; i < allOptions.subtitles.length; i++) {
      try {
        const sub = allOptions.subtitles[i];
        const path = `${paths.subtitle}/${sub}/index.m3u8`;
        const ffdata = await probeInput(path);
        // console.log(
        //   ffdata.streams.filter((dt) => dt.codec_type === "subtitle")
        // );
        if (ffdata.streams.every((dt) => dt.codec_type === "subtitle")) {
          segments.subtitles.push({ uri: `subs/${sub}/index.m3u8` });
        }
      } catch (err) {}
    }

    const str = JSON.stringify(segments, null, 2);
    writeFileSync("./m3u-manifest.json", str, defaultEncoding);
    return segments;
  } catch (err) {
    console.error("Error parsing HLS streams :", err);
    return null;
  }
};

// Test
const dir = "./out/turning-rajasthan";
const data = await parseHLSStreams({
  dir: dir,
  videoMaster: "master.m3u8",
  audioIndexes: ["audio-1/index.m3u8"],
  subtitles: ["sub-1"],
});
data && createMasterPl(dir, data);
