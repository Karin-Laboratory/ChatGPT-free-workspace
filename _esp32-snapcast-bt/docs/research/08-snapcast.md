# 08 Snapcast client

Protocol flow: TCP default 1704, Hello, Server Settings, Codec Header, timestamped Wire Chunks, periodic Time exchanges estimating server/client clock offset. Receiver needs framing/endian parsing, identity, codec setup, bounded queue, scheduler, drift correction and reconnect. JSON-RPC optional.

Start with server-side PCM, 16-bit stereo 48 kHz: 48,000 × 16 × 2 = 1.536 Mbit/s = 192,000 B/s, excluding TCP. Raw buffers: 100 ms 19.2 kB; 500 ms 96 kB; 1 s 192 kB. RP2040's 264 KiB must also hold network/BT/SBC/parser/stacks/output. Use bounded streaming ring; defer FLAC/Opus decode. Arduino Snapclient supports PCM/Opus and README reports ESP32 testing; RP2040 discussion includes W5500, not Pico W+A2DP proof.

A2DP/speaker buffers add delay; compare captured output to reference client and measure drift/dropouts. Sequence: desktop parser, TCP hello, PCM ring, standalone A2DP tone, concurrent radio, combined receiver.

Refs: [protocol](https://github.com/badaix/snapcast/blob/develop/doc/binary_protocol.md), [server config](https://github.com/badaix/snapcast/blob/develop/server/etc/snapserver.conf), [Arduino client](https://github.com/pschatzmann/arduino-snapclient), [RP2040 discussion](https://github.com/pschatzmann/arduino-snapclient/discussions/13).
