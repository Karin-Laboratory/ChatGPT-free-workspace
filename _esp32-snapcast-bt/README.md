# ESP32 Snapcast → Bluetooth bridge

Status: architecture / hardware decision pending (2026-10-20)

## Goal
Receive audio from an existing Snapserver over Wi-Fi and transmit to a Harman Kardon (HK) Bluetooth speaker using A2DP Source. Reuse existing Snapcast server and avoid additional Linux computers.

## Critical hardware constraint
ESP32-C3 supports Bluetooth LE only and CANNOT provide Classic Bluetooth A2DP Source. ESP32-S3/C6 have the same issue. The original dual-mode ESP32 (e.g. ESP32-WROOM-32 or ESP32-WROVER) supports Bluetooth Classic A2DP Source.

References:
- https://docs.espressif.com/projects/esp-idf/en/stable/esp32c3/api-guides/ble/overview.html
- https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/bluetooth/esp_a2dp.html

## Candidate designs
A. Preferred: original ESP32 Wi-Fi Snapclient -> PCM ring buffer -> SBC/A2DP Source -> HK speaker.
B. Keep ESP32-C3: Wi-Fi Snapclient -> external, explicitly verified A2DP transmitter (via suitable audio interface). Requires extra hardware, likely I2S/audio DAC or analog module depending on transmitter, and validation of clock/interface.

## Reference sources
- https://github.com/CarlosDerSeher/snapclient (Snapcast protocol, buffering, synchronization)
- https://github.com/espressif/esp-idf/tree/master/examples/bluetooth/bluedroid/classic_bt/a2dp_source (A2DP Source)
- https://github.com/pschatzmann/ESP32-A2DP (alternative library; Classic-BT ESP32 only)

## Planned phases
1. Confirm exact HK speaker model, ESP32 board type, Flash/PSRAM, and existing Snapserver format.
2. Baseline A2DP Source paired to HK with generated PCM tone; test reconnect and stable streaming.
3. Wi-Fi + A2DP coexistence and jitter-buffer/underrun telemetry.
4. Snapcast connect, discovery (mDNS fallback to static IP), Hello, time sync, settings and PCM chunks.
5. Integrate decoded PCM with A2DP callback via lock-safe ring buffer, initially 48kHz 16-bit stereo if supported.
6. Measure Bluetooth output latency against a reference snapclient; expose user-adjustable group/client latency offset as supported, document residual jitter.
7. Reconnect, watchdog, NVS config, Wi-Fi credentials security; reproducible GitHub Actions firmware build and flash guide.

## Architecture rules
- Prefer ESP-IDF, pin/tag dependencies, no copied third-party source without license attribution.
- Keep all secrets out of Git. Prefer NVS/provisioning for Wi-Fi credentials.
- Never invoke Wi-Fi/network reads or blocking decoder work from A2DP PCM callback.
- Start with PCM at snapserver for a simple path. Add FLAC/Opus only after measuring CPU and memory budgets.
- A2DP buffering latency is variable; multi-room synchronization is a hypothesis to test, not a guaranteed property.
- For C3 hardware, do not attempt to enable unsupported Classic Bluetooth in software.

## Suggested future source tree
```
_esp32-snapcast-bt/
  README.md
  firmware/
    CMakeLists.txt
    main/
      app_main.c
      snapcast_client.c
      audio_ringbuffer.c
      a2dp_output.c
      network_config.c
  docs/
    hardware-matrix.md
    validation-plan.md
```

## Open questions
- HK speaker exact model and codec capabilities.
- C3 mandatory or original ESP32 board acceptable?
- Which Snapserver host, stream codec and sample format?
- How strict is synchronization with other Snapcast rooms?
