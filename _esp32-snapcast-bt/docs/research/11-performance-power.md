# 11 Performance and power

Estimates, not measurements:
- PCM 48 kHz / 16-bit stereo: 1.536 Mbit/s, 192,000 B/s.
- 100 ms raw PCM: 19.2 kB; 500 ms: 96 kB; 1 s: 192 kB.
Network headers excluded. 264 KiB SRAM also holds radio/network/BT/SBC/parser/stacks/audio queues. Use bounded ring.

Unknown/unmeasured: clock, current, regulator thermals, concurrency, SBC timing, speaker latency, dropouts, reconnect, drift, 24h stability/sync. Historical Pi undervoltage not necessarily Pico-caused; vcgencmd unavailable. A2DP encoding/speaker buffering add CPU/delay. Measure free SRAM, stack high-water, SBC time, ring occupancy, underruns, retries, reconnect, output delay and drift against reference.

No radio means RP2040 cannot do requested wireless job. With verified CYW43439 a PCM prototype is plausible but high risk. Refs: [datasheet](https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf), [A2DP CPU note](https://arduino-pico.readthedocs.io/en/latest/a2dp.html), [Snapcast protocol](https://github.com/badaix/snapcast/blob/develop/doc/binary_protocol.md).
