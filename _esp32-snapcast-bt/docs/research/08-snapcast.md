# 08 Snapcast client

Protocol flow: TCP default 1704, Hello, Server Settings, Codec Header, timestamped Wire Chunks, periodic Time exchanges estimating server/client clock offset. Receiver needs framing/endian parsing, identity, codec setup, bounded queue, scheduler, drift correction and reconnect. JSON-RPC optional.

The measured live `HomeAudio` stream is FLAC, 48 kHz/16-bit/stereo, 20 ms chunks. A receiver must process Snapcast's codec header and FLAC chunks; PCM-only is not compatible with this stream. FLAC decoding on RP2040 is not yet evaluated. PCM remains an alternative only if a separately approved server-side stream is provided. Raw PCM equivalent is 192,000 B/s; buffers are 19.2 kB per 100 ms and 96 kB per 500 ms, before TCP/network/BT/SBC/parser/stacks in 264 KiB SRAM.

The host C++ protocol library now parses bounded little-endian frames, codec headers, and timestamped Wire Chunks and tests fragmentation/length handling. It does not perform the complete client lifecycle, clock synchronization, FLAC decode, buffering/scheduling, or A2DP. Arduino Snapclient reports PCM/Opus support and ESP32 testing; RP2040 discussion includes W5500, not proof of Pico W+A2DP compatibility.

A2DP/speaker buffers add delay; compare captured output to reference client and measure drift/dropouts. Sequence: desktop parser, TCP hello, PCM ring, standalone A2DP tone, concurrent radio, combined receiver.

Refs: [protocol](https://github.com/badaix/snapcast/blob/develop/doc/binary_protocol.md), [server config](https://github.com/badaix/snapcast/blob/develop/server/etc/snapserver.conf), [Arduino client](https://github.com/pschatzmann/arduino-snapclient), [RP2040 discussion](https://github.com/pschatzmann/arduino-snapclient/discussions/13).
