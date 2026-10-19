# Firmware build, write, and recovery gate

## Current status

**NOT READY TO BUILD OR FLASH target firmware.** The board radio, antenna, wiring, and exact core/library compatibility are unknown. There is no target firmware project and this repository does not generate a UF2. CI validates only the host-side protocol library and preflight utility. A host-test executable or source build is not a UF2 and cannot be copied to the board.

The target is still in BOOTSEL (`2e8a:0003`, serial recorded in the hardware investigation). Do not write, erase, reset, or mount the virtual RPI-RP2 volume during this development stage.

## Build/UF2 automation gate

Before adding a firmware target or automatic UF2 workflow:

1. Identify board front/back markings, actual radio/controller, antenna, and RP2040 wiring from unpowered photos and a matching schematic. Keep the board's flash size and power design identified.
2. Prove that the exact radio implementation supports 2.4 GHz Wi-Fi and Bluetooth Classic BR/EDR A2DP Source concurrently. BLE or A2DP Sink support is insufficient.
3. Select one exact toolchain and pin its SDK/core, libraries, compiler, and build action revisions. Implement an A2DP test-tone target first, then Snapcast/FLAC reception only after its hardware path passes.
4. CI must build the real target and produce UF2 only from that target. Publish the UF2 as a workflow artifact; never add it to source control or run a flash command in CI. Fail closed when the board gate or build target is absent.
5. Run protocol tests, format checks, target compilation, static SRAM/flash report, and artifact checksum before calling the build reproducible.

Until these gates pass, host CI must not emit a placeholder, empty, or otherwise misleading UF2.

## Future write procedure (not authorized/executed)

Writing requires a separate explicit user authorization after reviewing a hardware-matched build. Before that step, verify the UF2 target, checksum, board identity, supply stability, and a proven recovery image/path. Stop if voltage warnings, USB resets, or ambiguous board identity appear. Use only the documented board-specific UF2 procedure; never let automation flash hardware. Confirm the resulting USB identity and firmware version after the separately approved operation.

## Recovery plan (not yet validated)

The current flash capacity and a restorable original image are unknown. No safe recovery procedure can be claimed until the flash part/layout is identified and a complete, verified backup/recovery artifact is available. Do not erase or overwrite the existing firmware/flash in an attempt to discover capacity. If a future board has no verified backup/recovery path, do not flash it.

Recovery must be tested on a sacrificial, hardware-identical board before using the target. The recovery instructions must name the exact board, image checksum, BOOTSEL entry method, and a verified restore route. This document intentionally does not give an executable write command while those facts are unknown.
