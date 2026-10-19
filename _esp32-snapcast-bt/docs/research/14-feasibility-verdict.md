# 14 Feasibility verdict

The device enumerates RP2 BOOTSEL USB and previously returned a ROM version mapped to RP2040 B2. Picotool basic found no SDK Binary Info. Flash size/radio UNKNOWN; Pico W compatibility unproven. RP2040 alone is UNSUPPORTED for Wi-Fi/Bluetooth because it has no radio. CYW43439 and compatible wiring would make SDK/BTstack and Arduino-Pico A2DP paths plausible, not proven on this board.

PCM Snapcast 48k/16-bit/stereo is an experiment only after Wi-Fi proof: ~192 kB/s, bounded buffers needed, and TCP+BT+SBC in 264 KiB is high risk. Speaker buffers threaten multiroom sync.

| Rank | Choice | Assessment |
|---:|---|---|
| 1 | D Pi 2 Snapclient + verified USB Classic-BT adapter | fastest proof, verify adapter |
| 2 | E Original BR/EDR-capable ESP32 | strong standalone option; exact SKU check |
| 3 | C Fake Pico + ESP32 | plausible, complex PCM/timing bridge |
| 4 | B Fake Pico + A2DP Source module | requires verified Pico Wi-Fi and source role |
| 5 | A Fake Pico alone | UNKNOWN; impossible without onboard radio |

Not test results. BLE-only/C3/C6 must not be assumed Classic A2DP. Recommend identify board first; Pi2+adapter can test HK without Pico modification. If radio is found, test tone, TCP, concurrency, PCM in stages. No firmware write/erase/reset/RAM execute/storage mount/SWD.
