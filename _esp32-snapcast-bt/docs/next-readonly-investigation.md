# Next phase: RP2040 BOOTSEL read-only hardware interrogation

2026-10-20. Target host SSH alias `raspi2`. Device is presently RP2 Boot `2e8a:0003`, USB serial `E0C9125B0D9B`.

## Safety gates

- This phase is **read-only**. Do not flash, erase, reboot, reset, load RAM executables, mount/write RPI-RP2 or open serial/SWD ports.
- On raspi2, preceding log shows `Undervoltage detected!`, USB disconnect and read I/O errors. First inspect `vcgencmd get_throttled` (if available), `dmesg`, USB sysfs descriptors and live device presence. If voltage is currently abnormal or USB repeatedly resets, STOP further USB interrogation.
- Only query USB device which matches VID:PID and serial. Never assume `/dev/sdb` is stable.
- Prefer an already-installed `picotool`; do not download/compile/install third-party binaries, add udev rules or change permissions as part of this phase.
- If `picotool` is available, inspect its version/help, confirm command flags and use only `picotool info` modes that cannot alter boot state. No `load`, `reboot`, `erase`, `save`, `otp` writes, or bootrom update.
- `picotool info -a` may expose program metadata from flash/ROM; record reported target, RP2040 revision and flash size **only when explicitly shown**, with raw redacted output.
- USB strings and picotool values are observations, not cryptographic device authenticity proofs.
- RPI-RP2 mass-storage size of 128 MiB is virtual, not flash capacity.
- Wi-Fi/BT hardware does not normally enumerate directly over USB while RP2040 is in BOOTSEL. A radio absence claim must not be inferred from USB.
- Do not commit serial numbers beyond what has already been approved in documentation; redact other unique IDs and sensitive host details.

## Suggested non-mutating commands
```sh
date -Is
uname -a
vcgencmd get_throttled 2>/dev/null || true
dmesg | tail -n 120
lsusb -d 2e8a:0003
lsusb -t
command -v picotool || true
picotool version 2>/dev/null || true
picotool help info 2>/dev/null || true
```
After voltage stability and inspecting the help, use `picotool info` or the version-supported `picotool info -a`. Never install software or force access changes without explicit permission.

## Recording outcome
Append observations, actual executed commands and results to `docs/hardware-investigation.md`; preserve previous findings. Distinguish CONFIRMED, INFERRED, UNKNOWN. If blocked by power or tooling, record that and STOP.

## Hardware gate beyond USB
Request photos of both sides, part markings, antenna/screening, board identity. **No firmware implementation** until Wi-Fi and BT hardware capability are proven. A plain Pico clone lacks built-in radio and cannot perform Wi-Fi + A2DP alone.

## Build decision
If compatible CYW43439 radio, inspect board pinout and plan Arduino-Pico A2DP Source tone smoke test **only after separate flash authorization**. If not, propose verified external Wi-Fi/BT peripherals or a different board and measure RP2040 memory limits.
