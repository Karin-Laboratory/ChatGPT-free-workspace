# Integration readiness

調査日時: 2026-10-20 JST. This is a readiness assessment, not a firmware implementation.

## Observed integration endpoints

- Venue shows the Bluetooth peer named HK Onyx Studio paired, trusted and connected; Audio Sink and AVRCP UUIDs are present. Numeric model variant is unresolved.
- Venue runs BlueZ 5.82, PipeWire 1.4.2 and WirePlumber 0.5.8. BlueZ link state was connected, but SSH user's PipeWire graph showed only Dummy Output; codec and active A2DP route remain UNKNOWN.
- Snapserver's user-supplied host did not respond to TCP candidates 1704/1705/1780 or the HTTP JSON-RPC request from raspi2. The SSH alias failed DNS; using its configuration with the supplied address failed authentication. A direct SSH attempt from agent-101-vm also reached authentication but was rejected; no remote command ran. Version, live stream, codec, rates, ports and buffers remain UNKNOWN.
- Existing historic stream snippet (FLAC, 48000:16:2, chunk_ms=20) is not verified as current. Do not configure firmware from it.
- RP2040 clone radio hardware is still UNKNOWN per the primary hardware investigation. RP2040 alone has no Wi-Fi or Bluetooth.

## Readiness gates

1. Resolve authorized read access for the target SSH endpoint; the provided direct route currently rejects the existing credentials. Then inspect status/config and ports without service changes.
2. Identify Pico radio/antenna/pin wiring and flash capacity from markings/schematic.
3. Establish a real A2DP audio node on Venue and identify the codec negotiated during actual playback (requires a separately authorized audio test; none was sent).
4. If hardware supports it, prototype Snapcast server-side PCM 48kHz/16-bit/stereo and measure buffering/clock drift. Payload is 192 kB/s; 264 KiB SRAM is shared by network, Bluetooth, SBC, protocol and buffers.
5. Pair the Pico as a new independent A2DP Source; Venue link keys are not portable.

Snapserver setting changes or additional streams were not made. Bluetooth scan/pair/connect/disconnect or audio transmission were not performed. No Pico firmware or USB storage was modified.
