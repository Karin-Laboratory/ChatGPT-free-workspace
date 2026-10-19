# 06 Wi-Fi

Unit Wi-Fi = UNKNOWN. BOOTSEL USB cannot prove or disprove an SPI-attached radio. No radio marking, antenna, schematic, CYW43 initialization or wiring observed. RP2040 alone has no Wi-Fi.

DOCUMENTED reference: Pico W uses Infineon CYW43439, 2.4 GHz 802.11n, antenna and SPI up to 33 MHz; Pico SDK offers CYW43 driver with lwIP poll/background/FreeRTOS architectures. Not proof about clone.

Alternatives: ESP8266/ESP32 AT-UART (PCM/backpressure uncertain); separate ESP32 (verify exact SKU for Classic BT); W5500 wired Ethernet; USB Wi-Fi (host capability does not imply embedded driver/firmware/RAM fit); external CYW43 only with supported wiring. DHCP/mDNS/reconnect untested. Keep credentials out of source/logs.

Refs: [Pico wireless docs](https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html), [CYW43 architecture](https://github.com/raspberrypi/pico-sdk/blob/master/src/rp2_common/pico_cyw43_arch/include/pico/cyw43_arch.h), [RP2040/W5500 discussion](https://github.com/pschatzmann/arduino-snapclient/discussions/13).
