# 05 Board identity / compatibility

USB identity indicates RP2 BOOTSEL-compatible behavior, not maker/model. PCB revision, dimensions, headers, pinout, MCU/flash markings, oscillator, regulator, USB protection, LED/button/reset/SWD routes and power design UNKNOWN; no photos provided. Serial generation unknown and not authentication.

Official Pico and Pico W share form factor but differ in radio, antenna, routing and debug-pad placement. This is a reference, not clone evidence. Historical MaxPower descriptor 500 mA is not measured consumption or regulator rating. Pi undervoltage may originate from supply/cable/hub/other peripherals.

Next: unpowered board photos, IC/flash/crystal markings and silkscreen; compare to [official Pico layout/design docs](https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html). Verify radio SPI/control/IRQ/power/RF from schematic; do not energize unknown GPIO.
