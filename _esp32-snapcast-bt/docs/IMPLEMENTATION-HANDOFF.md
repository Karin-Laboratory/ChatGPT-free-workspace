# Codex implementation handoff (2026-10-20)

## Status: NOT READY TO FLASH

The Snapserver and HK endpoints are now identified, but the RP2040 board's wireless circuitry is still **UNKNOWN**. BOOTSEL + RP2040 rev B2 DOES NOT mean the board has Wi-Fi/Bluetooth. Do not claim the firmware only needs flashing or produce a purported working UF2 before the hardware gate.

## Verified endpoints and capabilities

- Snapserver 0.31.0, hostname `homeaudio-40-vm`; observed over HTTP JSON-RPC `Server.GetStatus` returning 200.
- Runtime stream `HomeAudio`, `playing`, URI `pipe:///run/snapserver/snapfifo`, `codec=flac`, `sampleformat=48000:16:2`, `chunk_ms=20`.
- 3 connected clients at observation time, reported latency 0 ms. Server buffering, mDNS, exact audio/control port roles (1704/1705) remain not fully confirmed.
- Agent VM can TCP connect to port 1704, 1705, 1780; raspi2 timed out at all, so the Pi's networking cannot be assumed equivalent to a future Wi-Fi client. HTTP JSON-RPC is confirmed on 1780. SSH authentication failed; do not require SSH.
- HK device displays `HK Onyx Studio`, has A2DP Sink UUID 0000110b-0000-1000-8000-00805f9b34fb, paired+trusted+connected on Venue as observed. Active SBC/other codec and precise generation unknown.
- HK MAC exists only in an untracked Venue-derived local config. That BlueZ pairing cannot be cloned into the Pico; a fresh A2DP Source pairing is required.
- Pico: BOOTSEL USB VID/PID 2e8a:0003 and serial recorded in internal investigation; RP2040-compatible ROM revision byte 0x03 => B2. Flash JEDEC/size and onboard radio are not proven. Flash writes not authorized in previous investigations.

## Required implementation gates

1. Identify both faces of target board, actual radio chip, antenna, and RP2040 wiring. If no Pico W-compatible radio, stop A2DP firmware path and document external radio or original dual-mode ESP32 alternative. Never assume USB exposes onboard radio.
2. Verify Wi-Fi + BR/EDR A2DP Source is supported by the **exact** board/core/libraries, including simultaneous operation. Freeze toolchain dependency versions; prefer official documented Arduino-Pico + BTstack path or Pico SDK based on proven support. Do not substitute BLE.
3. Build an A2DP test tone and prove fresh pairing with HK; do not disrupt Venue automatically. User authorizes explicit, controlled speaker pairing and actual flash separately.
4. Implement Snapcast TCP framing, hello, settings, codec header, server time sync, timestamped chunks, bounded jitter queue, reconnect, and PCM output. Live stream is **FLAC**; using PCM-only with `HomeAudio` will fail. Options: measure feasibility and implement FLAC decoder, or obtain explicit authorization to add a separate `PCM` stream on server. Do NOT silently change the existing HomeAudio stream.
5. Explicitly plan resampling / sample clocks; A2DP SBC source callback must not block on Wi-Fi. Measure memory after lwIP/BTstack, decode and stacks. 48 kHz 16-bit stereo PCM=192000 B/s; 20-ms chunk=3840 B; 100 ms=19200 B.
6. Measure HK A2DP output latency relative to another Snapclient, tune delay compensation, and report drift/underruns. Zero configured Snapcast client latency does NOT imply zero speaker transport latency.
7. Only after stages pass, build reproducible UF2 in CI, add documented recovery plan and obtain user approval to flash.

## Real configuration

- Public GitHub: `config/connection.example.json` containing observed non-secret values, null for exact host and MAC.
- Private deployment config: supply snapserver host locally, and HK address locally; never commit pairing keys, access credentials, local identifiers. Never assume another machine can access `/home/masataka/.config/pico-snapcast-bt/venue-connection.local.json`; respect ownership and avoid copying it to CI.
- Preflight host-only utility: `scripts/preflight.py`; this does **not** operate Pico and cannot validate BLE/Classic hardware.

## Non-destructive acceptance criteria before flashing

- Hardware report identifies exact chip and tested SDK capability.
- Host preflight connects to live `Server.GetStatus` and verifies stream; pass/fail must not alter server.
- Firmware compiles and static tests pass under pinned dependencies.
- A2DP pairing and end-to-end streaming require later user-authorized hardware test; avoid saying they are already proven.

## Snapshot references

`docs/hardware-investigation.md`, `docs/research/`, `docs/integration/snapserver-live.md`, `docs/integration/hk-bluetooth.md`, `docs/integration/integration-readiness.md`.
