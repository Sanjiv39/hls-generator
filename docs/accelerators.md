## ⚙️ Supported Hardware Accelerators

| **Platform**       | **Hardware Accelerators**                |
| ------------------ | ---------------------------------------- |
| NVIDIA             | `cuda`, `cuvid`, `nvdec`                 |
| AMD                | `dxva2`                                  |
| Intel              | `qsv`, `vaapi`                           |
| Mac M Series       | `videotoolbox`                           |
| General (Software) | `d3d11va`, `opencl`, `vulkan`, `d3d12va` |

## ✅ Notes

- Set by using `accelerator` with `decodingDevice`.
- If no `decodingDevice` is specified with the `accelerator` it will only allow **General** codecs.
- Also verify available hardware accelerators by `ffmpeg -hwaccels`.
- ⚠️ Only use accelerators relative to the device you have, don't use any other.
