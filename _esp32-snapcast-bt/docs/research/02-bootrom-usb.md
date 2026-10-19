# 02 BOOTROM and USB

Direct observation: USB full-speed 12 Mbit/s, configuration 1, Mass Storage via usb-storage plus vendor-specific Picoboot interface, product RP2 Boot, serial E0C9125B0D9B. Historical 128 MiB RPI-RP2 is a virtual boot volume, not physical flash. No RP2 ttyACM/ttyUSB. CH340 was present in an older snapshot only; serial not opened because DTR/RTS may affect reset.

Picotool info basic returned Program Information none. Earlier source audit found info all and RP2040 serial selection may invoke flash-ID helper that transfers/executes RAM code; not used. Previous bounded PC_READ returned ROM byte 0x03 at address 0x13. No new ROM bytes or dump this session. BOS, full endpoint descriptors and bootloader build identity UNKNOWN.

Documented RP2040: 16 KiB ROM, 264 KiB SRAM, external-flash XIP mapping; ROM provides boot and USB boot interfaces/public function tables. USB 1.1 host/device capability; currently BOOTSEL device. SWD is an MCU feature, clone pad availability UNKNOWN. Picoboot has mutating command types, none used. Historical dmesg includes undervoltage/disconnect/read errors followed by Voltage normalised; current vcgencmd status unavailable.

Refs: [datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf), [SDK bootrom API](https://github.com/raspberrypi/pico-sdk/blob/master/src/rp2_common/pico_bootrom/include/pico/bootrom.h), [ROM source](https://github.com/raspberrypi/pico-bootrom-rp2040), [picotool v2.1.1](https://github.com/raspberrypi/picotool/tree/2.1.1).
