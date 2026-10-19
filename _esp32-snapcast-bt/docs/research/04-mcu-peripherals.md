# 04 RP2040 peripherals

DOCUMENTED RP2040 baseline, not board-level measurements:

| Resource | Specification | Relevance |
|---|---|---|
| CPU | dual Cortex-M0+, up to 133 MHz | actual clock unknown |
| SRAM | 264 KiB, multi-bank | shared among protocol, stacks, radio, SBC, PCM |
| XIP | external QSPI flash/cache | target flash unknown |
| DMA | 12 channels | peripheral/audio transfer |
| PIO | 2 blocks × 4 state machines | custom timing, not radio |
| UART/SPI/I2C | 2 / 2 / 2 | board routing unknown |
| PWM | 8 slices / 16 channels | simple audio option |
| ADC | 3 external 12-bit + temperature sensor | board mux unknown |
| GPIO | multifunction, board exposes subset | pin map unknown |
| Timers/watchdog | timer alarms and watchdog | pacing/recovery |
| USB | USB 1.1 host/device controller/PHY | currently BOOTSEL device |
| Low power / IRQ / SWD | sleep, dormant, NVIC, SWD | clone wiring/access unknown |

Pico W multiplexes CYW43 signals with some board functions; do not assume clone wiring. DMA/PIO do not add Bluetooth or SRAM. [RP2040 datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf), [Pico SDK](https://github.com/raspberrypi/pico-sdk/tree/master/src/rp2_common).
