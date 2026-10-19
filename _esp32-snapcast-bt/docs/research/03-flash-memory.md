# 03 SPI flash

Physical capacity, JEDEC ID, vendor/part, SFDP, erase geometry, firmware contents and read protection UNKNOWN. The 128 MiB RPI-RP2 is virtual. A prior bounded 512-byte read found the first two pages identical/erased-looking, so capacity inference stopped; repeated data is not capacity evidence. No full dump.

RP2040 commonly uses external QSPI NOR via XIP, but this board's part is unknown. Picotool basic showed no Binary Info, which does not establish blank flash or absent firmware. UF2 contents were not read.

Picotool v2.1.1 JEDEC path exits XIP, transfers a helper to RAM and executes PC_EXEC. Since RAM execution is prohibited, info all/JEDEC query were not run. Next inspect flash marking in an unpowered photo. If necessary, design a bounded read-only method after source/address audit; do not use write/erase/reset, whole dump, or infer capacity from aliasing. Replaceability unknown.

Refs: [RP2040 datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf), [Pico W datasheet](https://datasheets.raspberrypi.com/picow/pico-w-datasheet.pdf), [picotool source](https://github.com/raspberrypi/picotool/tree/2.1.1).
