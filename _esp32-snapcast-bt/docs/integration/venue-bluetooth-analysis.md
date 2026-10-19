# Venue Bluetooth implementation analysis

- Source repository: Karin-Laboratory/Venue5055-Kitchen
- Source revision inspected: 0518bce2429ee6f7b6f0849ef41c01ed8d16f087
- Date: 2026-10-20 JST
- This section reports source behavior plus separately labeled live state; it does not claim direct code execution.

## Existing behavior from source

The local Bluetooth API binds loopback port 8094. The Venue UI displays cached/paired audio devices and sends the chosen device address to the API; the local JSON state stores preferred address/name and prior default sink. The status route calls BlueZ info and reports paired/connected/trusted/UUID state. Refresh with scan=1 starts an active scan; it was not called. Connect/disconnect/mode endpoints can alter pairing, trust, connection or audio routing and were not called.

Connect path validates a Classic MAC, powers on the adapter, pairs if needed, marks the speaker trusted, requests the A2DP Sink profile for the remote device, waits for BlueZ info to report connected, then selects/unmutes the matching BlueZ PipeWire sink and moves mpv/Chromium streams. This is Venue acting as the A2DP Source. Existing link keys reside in Venue/BlueZ controller state; do not assume they can be copied to a Pico. A Pico is a different Bluetooth identity and should pair independently.

The monitor checks every 2 seconds, polls device state every 5 seconds while audio mode is enabled, restores the local sink on loss and attempts bounded reconnects. Retry implementation is tailored to this Linux service and its PipeWire environment; it is not directly portable to BTstack. The source tree contains no full incident history; the AVDTP Suspend comment is the concrete prior speaker issue found.

WirePlumber config sets suspend-timeout-seconds=0 for the selected Onyx BlueZ output because the speaker failed to answer AVDTP Suspend during track gaps. Its node name includes a device-specific address placeholder in source. Treat this as a venue-specific workaround, not a protocol requirement.

A separate oneshot systemd helper restores Venue's Bluetooth adapter public identity after controller initialization so BlueZ can load existing bonds. Its code invokes btmgmt power-off and public-addr operations. It is a state-changing boot helper; it was inspected, never executed by this investigation.

## Live read-only state

BlueZ 5.82. Venue API reported audio mode and preferred HK Onyx Studio paired/trusted/connected. Device UUIDs confirm Audio Sink, AVDTP and AVRCP services. PipeWire 1.4.2, WirePlumber 0.5.8, pactl 17.0. The queried SSH-user PipeWire graph showed Dummy Output and no visible BlueZ sink/card; hence connected Bluetooth is not evidence of active audio routing. See [HK observation](hk-bluetooth.md).

Source links:
- [Bluetooth API](https://github.com/Karin-Laboratory/Venue5055-Kitchen/blob/0518bce2429ee6f7b6f0849ef41c01ed8d16f087/src/deploy/libexec/venue-bluetooth-api.py)
- [adapter identity helper](https://github.com/Karin-Laboratory/Venue5055-Kitchen/blob/0518bce2429ee6f7b6f0849ef41c01ed8d16f087/src/deploy/libexec/venue-bluetooth-address.py)
- [WirePlumber Onyx rule](https://github.com/Karin-Laboratory/Venue5055-Kitchen/blob/0518bce2429ee6f7b6f0849ef41c01ed8d16f087/src/deploy/wireplumber/user/wireplumber.conf.d/52-venue-onyx.conf)
- [Bluetooth systemd unit](https://github.com/Karin-Laboratory/Venue5055-Kitchen/blob/0518bce2429ee6f7b6f0849ef41c01ed8d16f087/src/deploy/systemd/etc/systemd/system/venue-bluetooth.service)
