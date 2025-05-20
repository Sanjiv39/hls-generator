# 🎞️ Video to HLS Converter

A Node.js script that converts any video file into an HLS (HTTP Live Streaming) format with separate audio, video, and subtitle segments. Hardware-accelerated encoding and decoding are supported using **AMD**, **NVIDIA**, and **Intel** GPU/CPU.

## ✨ Features

- Converts any video to HLS stream format
- Generates separate segments for:
  - Video
  - Audio
  - Subtitles
- Hardware acceleration support (AMD, NVIDIA, Intel)
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

- **Node.js** v22 or later
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

1. Generate `metadata.json` from input file

```bash
npm run input
```

2. Generate HLS chunks from `metadata.json` to given output folder

```bash
npm run output
```

#### OR

Process above processes consecutively

```bash
npm run convert
```
