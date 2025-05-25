## 🎚️ Intel Encoding Presets

1. QSV
   Codec Format - `<type>_qsv`, such as `h264_qsv` for H264.

   | **Type** | **Default** | **Presets**                                                               |
   | -------- | ----------- | ------------------------------------------------------------------------- |
   | H264     | `0`         | `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`, `0` |
   | HEVC     | `0`         | `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`, `0` |
   | AV1      | `0`         | `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`, `0` |

2. Vaapi
   Codec Format - `<type>_vaapi`, such as `h264_vaapi` for H264.

   | **Type** | **Default** | **Presets**                                             |
   | -------- | ----------- | ------------------------------------------------------- |
   | H264     | `-99`       | `constrained_baseline`, `main`, `high`, `high10`, `-99` |
   | HEVC     | `-99`       | `main`, `main10`, `rext`, `-99`                         |
   | AV1      | `-99`       | `main`, `high`, `professional`, `-99`                   |
