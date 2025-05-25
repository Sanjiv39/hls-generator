# 🎞️ Video to HLS Converter

A Node.js script that converts any video file into an HLS (HTTP Live Streaming) format with separate audio, video, and subtitle segments. Hardware-accelerated encoding and decoding are supported using **AMD**, **NVIDIA**, and **Intel** GPU/CPU.

## ❔ Usage of HLS

- Only one set of streams (1 video, 1 audio, and 1 subtitle) is rendered at a time, reducing server load.
- Adaptive bitrate streaming allows the video resolution to adjust automatically based on the user's internet connection.
- Streams are broken into small, time-based segments, so only the current and nearby chunks are loaded, minimizing bandwidth usage and server stress.
- Commonly used by streaming services to provide smooth and scalable content delivery.
- HLS content can be served via static servers or CDNs, ensuring fast and efficient video playback.

## ✨ Features

- Converts any video to HLS stream format
- Generates separate segments for:
  - Video
  - Audio
  - Subtitles
- Hardware acceleration support (AMD, NVIDIA, Intel)
- External support for Mac M CPUs via **[Brew](https://brew.sh/)**
- Uses `FFmpeg` under the hood
- Simple commands to generate metadata, convert, or run both steps in sequence

## 🔧 Requirements

- **[FFmpeg](https://ffmpeg.org/download.html)** installed and accessible from your system's PATH  
  Make sure FFmpeg is compiled with support for:

  - `vaapi` or `qsv` (Intel)
  - `nvenc` (NVIDIA)
  - `amf` (AMD)
  - `videotoolbox` (MAC - M series)

> Mac M cpus only support externally via brew
>
> - Install brew if not already
>   - `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
> - FFMPEG install via bew
>   - `brew install ffmpeg`

> You can check support via `ffmpeg -hwaccels` and `ffmpeg -encoders`

- **Node.js** v20 or later
- `npm` or `yarn`

## 📦 Installation

Clone the repository and checkout:

```bash
git clone https://github.com/Sanjiv39/hls-generator.git
cd hls-generator
```

Install dependencies

```bash
npm i
```

## 🕹️ Process

Create a `config.js` similar to [`config.example.js`](config.example.js)

1. Generate `metadata.json` from input file

```bash
npm run input
```

2. Generate HLS chunks from `metadata.json` to given output folder

```bash
npm run output
```

#### OR

3. Process above processes sequentially

```bash
npm run convert
```

## 📗 References

- [Config Examples](examples/config/)
- [Codecs](docs/codecs.md)
- [Hardware Accelerators](docs/accelerators.md)
- [Encoder Presets](docs/presets.md)
