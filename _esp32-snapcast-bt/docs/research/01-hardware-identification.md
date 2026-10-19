# 01 Hardware identification

調査日 2026-10-20 JST。CONFIRMED=実機観測、DOCUMENTED=一次資料、INFERRED=推定、UNKNOWN=未確認、UNSUPPORTED=仕様上不可。

- CONFIRMED: USB VID:PID 2e8a:0003, Raspberry Pi / RP2 Boot, serial E0C9125B0D9B。descriptorは模倣可能でsilicon authenticityを証明しない。
- CONFIRMED: picotool v2.1.1 info basic = Program Information none。SDK Binary Infoなしはアプリ不在の証明ではない。
- CONFIRMED (RP2040-compatible ROM response): previous bounded PC_READ byte 0x13=0x03; official picotool maps to B2.
- UNKNOWN: flash size/part, PCB maker/revision, radio/antenna/wiring, oscillator, regulator, USB protection, GPIO map, current/power.
- INFERRED: serial descriptor matches prior logs, likely same USB device; it does not prove historical B2 measurement was this same board.

Host CONFIRMED: Raspberry Pi 2 Model B Rev 1.1, Raspbian 13.6, kernel 6.18.50+rpt-rpi-v7. USB 12 Mbit/s, Mass Storage + vendor-specific interface. Full log: [hardware-investigation.md](../hardware-investigation.md). Serial generation mechanism unknown. No board photos were available; obtain unpowered front/back macro photos and markings before assigning a product model or Pico W compatibility.

Refs: [RP2040 datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf), [Pico series](https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html).
