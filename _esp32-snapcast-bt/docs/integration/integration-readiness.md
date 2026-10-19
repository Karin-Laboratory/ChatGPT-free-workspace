# Integration readiness

調査日時: 2026-10-20 JST. This is a readiness assessment, not a firmware implementation.

## Observed integration endpoints

- Venue shows the Bluetooth peer named HK Onyx Studio paired, trusted and connected; Audio Sink and AVRCP UUIDs are present. Numeric model variant is unresolved.
- Venue runs BlueZ 5.82, PipeWire 1.4.2 and WirePlumber 0.5.8. BlueZ link state was connected, but SSH user's PipeWire graph showed only Dummy Output; codec and active A2DP route remain UNKNOWN.
- Snapserver SSH still rejects the existing credentials, but the read-only HTTP JSON-RPC endpoint is now reachable from agent-101-vm. `Server.GetStatus` identifies Snapserver 0.31.0 and a playing `HomeAudio` pipe stream using FLAC, 48 kHz/16-bit/stereo, `chunk_ms=20`; current FIFO path is `/run/snapserver/snapfifo`. It reports 3 connected clients and one disconnected Snapweb client. raspi2 still times out to ports 22/1704/1705/1780; agent-101-vm TCP connects to all four. Full server config, buffer settings, mDNS and sound-server state remain UNKNOWN.
- The old snippet's format/chunk values match the current API result, but its `/tmp/snapfifo` path is stale; the current path is `/run/snapserver/snapfifo`.
- RP2040 clone radio hardware is still UNKNOWN per the primary hardware investigation. RP2040 alone has no Wi-Fi or Bluetooth.

## Readiness gates

1. Obtain authorized read-only access to the Snapserver host to inspect the service unit, full config, listener roles and buffering. JSON-RPC status is available from agent-101-vm without SSH.
2. Identify Pico radio/antenna/pin wiring and flash capacity from markings/schematic.
3. Establish a real A2DP audio node on Venue and identify the codec negotiated during actual playback (requires a separately authorized audio test; none was sent).
4. Current stream is FLAC at 48kHz/16-bit/stereo (raw PCM equivalent 192 kB/s). A constrained receiver must implement Snapcast framing and FLAC decode or the server operator can consider a PCM stream; neither RP2040 radio capability nor an additional PCM stream is confirmed. Measure buffering and clock drift before judging fit in 264 KiB SRAM.
5. Pair the Pico as a new independent A2DP Source; Venue link keys are not portable.

Snapserver setting changes or additional streams were not made. Bluetooth scan/pair/connect/disconnect or audio transmission were not performed. No Pico firmware or USB storage was modified.
