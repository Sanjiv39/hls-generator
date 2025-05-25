## 🎞️ Supported Video Codecs

| **Platform**       | **Codecs**                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| NVIDIA             | `h264_nvenc`, `hevc_nvenc`, `av1_nvenc`                                    |
| AMD                | `h264_amf`, `hevc_amf`, `av1_amf`                                          |
| Intel              | `h264_qsv`, `hevc_qsv`, `av1_qsv`, `h264_vaapi`, `hevc_vaapi`, `av1_vaapi` |
| Mac M Series       | `h264_videotoolbox`, `hevc_videotoolbox`                                   |
| General (Software) | `libx264`, `libx265`                                                       |

## ✅ Notes

- By default `libx264` is used.
- Set by using `videoCodec` with `encodingDevice`.
- If no `encodingDevice` is specified with the `videoCodec` it will only allow **General** codecs.
- Also verify available codecs by `ffmpeg -encoders`.
- ⚠️ Only use codecs relative to the device you have, don't use any other.
