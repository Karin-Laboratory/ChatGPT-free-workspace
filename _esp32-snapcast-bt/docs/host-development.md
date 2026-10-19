# Host-side development

This stage builds only the Snapcast protocol reference parser and the read-only status preflight. It does not build or flash Pico firmware.

## Requirements

- CMake 3.16 or newer
- C++17 compiler
- Python 3.11 or newer for the preflight tests (no third-party Python packages)

## Build and test

From this directory:

~~~sh
cmake -S . -B build/host -DBUILD_TESTING=ON
cmake --build build/host --parallel
ctest --test-dir build/host --output-on-failure
python3 -m unittest discover -s scripts -p 'test_*.py' -v
~~~

The C++ tests cover incremental and concatenated frames, typed FLAC codec headers and Wire Chunks, malformed lengths, size caps, and Hello JSON framing. These tests do not decode FLAC or emulate a complete Snapcast server/client exchange.

## Optional read-only live preflight

Provide the Snapserver host locally; do not save private LAN addressing or credentials in Git:

~~~sh
python3 scripts/preflight.py --host SNAPSERVER_HOST --stream HomeAudio --codec flac
~~~

This sends only `Server.GetStatus` to HTTP JSON-RPC. It does not connect as a Snapcast audio client, change the server, access the Pico, or test radio/BT capability. Current observed stream is `HomeAudio`, FLAC, `48000:16:2`, `chunk_ms=20`.

The CI workflow runs the host checks on pushes and pull requests. Firmware/UF2 build remains intentionally gated off until the exact board radio and a supported concurrent Wi-Fi + Bluetooth Classic A2DP Source stack are verified.
