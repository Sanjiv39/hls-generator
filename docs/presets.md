## 🎚️ Encoding Presets by Platform

| **Platform** | **Presets**                                                                    |
| ------------ | ------------------------------------------------------------------------------ |
| Intel        | `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`, `number` |
| NVIDIA       | `p1` → `p7`, `slow`, `medium`, `fast`, `default`,                              |
| AMD          | `balanced`, `speed`, `quality`                                                 |

## ✅ Notes

- Set by using `preset` with `encodingDevice`.
- If no `encodingDevice` is specified with the `preset` it will be fallbacked to `fast`.
- Also verify available hardware accelerators by `ffmpeg -h encoder=<video-codec>`.
- ⚠️ Only use presets relative to the `videoCodec` you provided, don't use any other.
