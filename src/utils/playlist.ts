type AudioMedia = {
  name?: string;
  default?: boolean;
  autoSelect?: boolean;
  language?: string;
  uri: string;
};

export const getAudioMediaStr = (data: AudioMedia) => {
  try {
    if (typeof data !== "object" || !data || Array.isArray(data)) {
      throw new Error("Data invalid");
    }
    if (!data.uri.trim()) {
      throw new Error("Uri must be specified");
    }
    let str = `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="${
      data.name || ""
    }",DEFAULT=${(data.default && "YES") || "NO"},AUTOSELECT=${
      (data.autoSelect && "YES") || "NO"
    },LANGUAGE="${data.language || ""}",URI="${data.uri.trim()}"`;

    str = str
      .split(",")
      .filter(
        (s) =>
          s.trim() &&
          s
            .trim()
            .replace(/ +/g, "")
            .match(/[=](\"|)(\"|)/)
      )
      .join(",");
    return str;
  } catch (err) {
    console.log("Error audio media :", err);
    return "";
  }
};

type SubtitleMedia = {
  name?: string;
  default?: boolean;
  autoSelect?: boolean;
  language?: string;
  uri: string;
};

export const getSubtitleMediaStr = (data: SubtitleMedia) => {
  try {
    if (typeof data !== "object" || !data || Array.isArray(data)) {
      throw new Error("Data invalid");
    }
    if (!data.uri.trim()) {
      throw new Error("Uri must be specified");
    }
    let str = `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="sub",NAME="${
      data.name || ""
    }",DEFAULT=${(data.default && "YES") || "NO"},AUTOSELECT=${
      (data.autoSelect && "YES") || "NO"
    },LANGUAGE="${data.language || ""}",URI="${data.uri.trim()}"`;

    str = str
      .split(",")
      .filter(
        (s) =>
          s.trim() &&
          s
            .trim()
            .replace(/ +/g, "")
            .match(/[=](\"|)(\"|)/)
      )
      .join(",");
    return str;
  } catch (err) {
    console.log("Error subtitle media :", err);
    return "";
  }
};

type VideoStream = {
  resolution?: string;
  codecs?: string;
  bandwidth?: number;
  uri: string;
};
export const getVideoStreamStr = (
  data: VideoStream[],
  options?: { linkAudio?: boolean; linkSubtitle?: boolean }
) => {
  try {
    if (!Array.isArray(data)) {
      throw new Error("Data invalid");
    }
    if (data.find((dt) => typeof dt.uri !== "string" || !dt.uri.trim())) {
      throw new Error("Uri must be specified for each stream");
    }
    const allOptions = { ...options };
    let str = "";
    for (let i = 0; i < data.length; i++) {
      const dt = data[i];
      str += `#EXT-X-STREAM-INF:BANDWIDTH=${
        Number(String(dt.bandwidth)) || ""
      },RESOLUTION=${
        dt.resolution
          ?.trim()
          .toLowerCase()
          .match(/[0-9]+[x][0-9]+/)?.[0] || ""
      },CODECS="${dt.codecs || ""}",AUDIO="${
        (allOptions.linkAudio && "audio") || ""
      }",SUBTITLES="${(allOptions.linkSubtitle && "sub") || ""}"\n${
        dt.uri
      }\n\n`;
    }
    str = str
      .split(",")
      .filter(
        (s) =>
          s.trim() &&
          s
            .trim()
            .replace(/ +/g, "")
            .match(/[=](\"|)(\"|)/)
      )
      .join(",");
    return str;
  } catch (err) {
    console.log("Error video media :", err);
    return "";
  }
};
