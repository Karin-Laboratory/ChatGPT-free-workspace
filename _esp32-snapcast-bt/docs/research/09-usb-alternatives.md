# 09 USB alternatives

BOOTSEL mass storage/Picoboot is not USB Audio, CDC, MIDI or Ethernet app firmware. RP2040 USB 1.1 host capability does not make Wi-Fi adapters plug-and-play; they require host drivers, radio firmware, RAM and stack.

| Architecture | Assessment |
|---|---|
| Pi 2 Snapclient + verified USB Classic-BT adapter | quickest proof; verify adapter/A2DP |
| Pico USB Audio Class to Pi | possible PCM bridge with UAC/clock firmware; no radio added |
| Pico CDC/MIDI | control/framed data, not ready audio |
| Pico + ESP32 | plausible if exact SKU supports Classic; PCM transport needed |
| Pico + I2S BT module | only documented A2DP Source |
| Ethernet + BT | less Wi-Fi contention; added hardware |

Pi 2+adapter can validate Snapcast/HK without changing Pico, but is not standalone. Do not mount/write RPI-RP2. Refs [RP2040 datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf), [TinyUSB](https://github.com/hathach/tinyusb).
