# 12 Reference projects (checked 2026-10-20)

| Source | Evidence | Limit |
|---|---|---|
| [RP2040 datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf) | MCU/resources/USB/boot | not clone schematic |
| [Pico docs](https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html) | W variant/CYW43439/layout | does not identify board |
| [Pico W datasheet](https://datasheets.raspberrypi.com/picow/pico-w-datasheet.pdf) | reference circuit | not clone pinout |
| [Pico SDK](https://github.com/raspberrypi/pico-sdk) | CYW43/lwIP/BTstack | no combined performance proof |
| [bootrom source](https://github.com/raspberrypi/pico-bootrom-rp2040) | ROM reference | no authenticity proof |
| [picotool 2.1.1](https://github.com/raspberrypi/picotool/tree/2.1.1) | code paths to audit | commands not all safe |
| [Arduino-Pico A2DP](https://arduino-pico.readthedocs.io/en/latest/a2dp.html) | source/SBC API | requires radio |
| [BTstack](https://github.com/bluekitchen/btstack) | Classic A2DP implementation | controller/license still matter |
| [Snapcast protocol](https://github.com/badaix/snapcast/blob/develop/doc/binary_protocol.md) | handshake/time/chunks | MCU fit unproven |
| [arduino-snapclient](https://github.com/pschatzmann/arduino-snapclient) | client/codecs | README tested ESP32 |
| [RP2040 discussion](https://github.com/pschatzmann/arduino-snapclient/discussions/13) | RP2040/W5500 report | not Pico W+BT support |
| [CarlosDerSeher/snapclient](https://github.com/CarlosDerSeher/snapclient) | embedded code to inspect | not target-validated |

Prefer specifications/source; issue/discussion posts are implementation reports. Pin versions before coding.
