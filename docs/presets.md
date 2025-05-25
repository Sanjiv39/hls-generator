## 🎚️ Encoding Presets by Platform

| **Platform**         | **Presets**                     |
| -------------------- | ------------------------------- |
| Intel                | [Check Here](presets/intel.md)  |
| NVIDIA               | [Check Here](presets/nvidia.md) |
| AMD                  | [Check Here](presets/amd.md)    |
| MAC                  | [Check Here](presets/mac.md)    |
| SOFTWARE (libx ones) | `fast`                          |

## ✅ Notes

- Set by using `preset` as per `videoCodec`.
- If no valid `preset` is specified with the `videoCodec`, default will be used.
- Also verify available presets by `ffmpeg -h encoder=<video-codec>`.
- ⚠️ Only use presets relative to the `videoCodec` you provided, don't use any other.
