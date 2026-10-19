# 10 Toolchain

After radio proof: Arduino-Pico for documented A2DP tone; Pico SDK + lwIP + CYW43 + BTstack for more memory/async control if transport matches; CMake/Arm GCC for reproducible builds; PlatformIO as pinned wrapper; TinyUSB for custom USB device class; FreeRTOS only if task isolation justifies SRAM overhead. picotool hardware commands need source audit. SWD pads UNKNOWN.

GitHub Actions can run host parser tests and compile offline. Pin SDK/submodules/compiler/container, report SRAM/flash, retain UF2 artifact, no auto-flash. Keep credentials out of repo/logs. OTA/dual-bank recovery is not established and depends on verified flash/layout. Plan backup/recovery before separately authorized writes.

Refs: [Pico SDK](https://github.com/raspberrypi/pico-sdk), [Arduino-Pico](https://github.com/earlephilhower/arduino-pico), [BTstack](https://github.com/bluekitchen/btstack), [picotool](https://github.com/raspberrypi/picotool).
