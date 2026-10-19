# Fake Pico (RP2040) Wi-Fi Snapcast → Bluetooth HK speaker

Status: feasibility / hardware identification (2026-10-20)
This project was initially scoped for ESP32; target changed to a Pico-compatible clone previously reported as RP2040 revision B2 with 2 MiB flash. **The USB-attached board investigated on 2026-10-20 has not yet been matched to that earlier unit or independently verified for MCU revision/flash capacity.** See [hardware investigation](docs/hardware-investigation.md).

## Confirmed hardware vs outstanding
- Confirmed on the current USB observation: Raspberry Pi RP2 Boot USB identity, serial `E0C9125B0D9B`, and BOOTSEL mass-storage/vendor-specific interfaces. RP2 Boot descriptors do not authenticate the silicon.
- Reported by the earlier investigation, but NOT re-confirmed on the current USB-attached unit: RP2040 rev B2 and 2 MiB flash. The UF2 boot volume's reported 128 MiB is not the flash size.
- NOT confirmed on the current unit: Pico W-compatible CYW43439 Wi-Fi/Bluetooth radio, radio wiring, or onboard antenna.
- Do not assume a board marketed as Pico/Pico W actually contains or wires up CYW43439.
- Genuine Pico W's CYW43439 and current software support Bluetooth Classic as well as BLE; Arduino-Pico provides a BluetoothAudio A2DP Source implementation. This remains conditional on compatible hardware and wiring.

## Goal
Wi-Fi (Snapserver) -> Snapclient protocol -> decoded PCM -> SBC/A2DP Source (BT Classic) -> Harman Kardon speaker.

## Preferred software experiment
- Arduino-Pico / BluetoothAudio.h A2DP Source example first, only after a compatible radio setup is verified.
- Reference: https://arduino-pico.readthedocs.io/en/latest/a2dp.html
- Reference: https://www.raspberrypi.com/news/new-functionality-bluetooth-for-pico-w/
- Explore https://github.com/pschatzmann/arduino-snapclient and RP2040 discussion https://github.com/pschatzmann/arduino-snapclient/discussions/13
- Pico SDK/lwIP/CYW43/BTstack alternative if Arduino solution cannot reliably coexist with Wi-Fi.
- Phase I: generate PCM tone -> HK via A2DP. Phase II: Wi-Fi TCP reception + tone; phase III: PCM Snapcast receiver; phase IV: jitter/drift/latency.
- Start with server-side PCM 16-bit stereo, 48 kHz when supported. Disable or reduce codec features until memory measured.
- RP2040 SRAM ~264 KiB total; 48k 16-bit stereo is 192000 bytes/second. 100 ms PCM buffer ~=19.2 KiB, 500ms ~=96 KiB excluding protocol stacks.
- Wi-Fi/BT share CYW43439 transport; concurrent use must be tested. A2DP inherently incurs speaker-side latency; measure sync with other Snapcast receivers instead of guaranteeing it.

## Mandatory gates before flashing the clone
1. Inspect photos/markings/BOM or non-destructive probes for wireless module. If absent, standalone Pico cannot receive Wi-Fi or transmit Bluetooth.
2. Pin-map compatibility with Pico W, verify CYW43 driver can initialize.
3. USB-only smoke tests without Wi-Fi secrets checked into Git.
4. A2DP Source paired with exact HK model. Record connection, reconnect, dropout and memory.
5. Wi-Fi + BT concurrent test prior to Snapcast implementation.

## Repository plan
- This folder is prefixed with '_' so the parent repository's Cloudflare build script ignores it.
- `firmware/` (Arduino-Pico PlatformIO or CMake per verified library compatibility)
- `docs/hardware.md` (chip identification and wiring, no assumptions)
- `docs/test-plan.md` (repeatable measurements)
- `docs/latency.md` (speaker buffering, offset and jitter)
- `README.md` (this plan)

## Decision rules
- If no wireless chip is present, either use verified external hardware or choose a separate Wi-Fi + BT board; do not fabricate Pico W features.
- Target choice is Pico clone, not ESP32. No ESP-IDF build targets in this project.
- Never save Wi-Fi credentials, pairing secrets or private addresses in Git.
- First produce reproducible test builds and logs, then the end-to-end client.
