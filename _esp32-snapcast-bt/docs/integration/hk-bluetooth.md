# Harman Kardon Bluetooth observation

- 調査日時: 2026-10-20 07:22 JST
- 観測ホスト: 既存SSH alias venue。実機の固有Bluetooth addressはローカルの mode-0600 設定ファイルに保存し、この公開文書には記載しない。
- 手順: 読み取りのみ。scan開始、新規pairing、connect/disconnect、音声送信なし。

## 観測値

| Property | Result | Status |
|---|---|---|
| BlueZ advertised name / alias | HK Onyx Studio | CONFIRMED from venue bluetoothctl info and local status API |
| Exact marketed generation/model number | UNKNOWN | Name does not distinguish numbered Onyx Studio generation |
| Bluetooth Classic identity/address | observed; stored only in local file | CONFIRMED privately; omitted from Git |
| Device Class | 0x00240414 (2360340) | CONFIRMED |
| Paired / Trusted / Connected | yes / yes / yes | CONFIRMED at observation time |
| Audio Sink UUID | 0000110b-0000-1000-8000-00805f9b34fb | CONFIRMED; HK exposes A2DP Sink role |
| AVRCP Target UUID | 0000110c-0000-1000-8000-00805f9b34fb | CONFIRMED |
| AVDTP UUID | 0000110d-0000-1000-8000-00805f9b34fb | CONFIRMED |
| AVRCP UUID | 0000110e-0000-1000-8000-00805f9b34fb | CONFIRMED |
| Active codec / supported codec set | UNKNOWN | No active BlueZ/PipeWire A2DP card was visible in the queried SSH user's session |

The Venue controller advertised Audio Source (UUID 110a), consistent with Venue acting as A2DP Source and HK as Sink. This is a BlueZ role/service observation, not proof the current audio path was routing sound.

Venue local Bluetooth API status returned mode=audio, manual_disconnect=false, connecting=false, no error, preferred device paired/trusted/connected. At the same time, wpctl status in the SSH user's PipeWire session showed only Dummy Output, and pactl reported no matching Bluetooth card/sink. Thus BlueZ link is connected, but live audio node/codec is not confirmed. No sound was sent during investigation.

The locally stored address is at ~/.config/pico-snapcast-bt/venue-connection.local.json (permissions 0600; containing directory 0700). The file is outside the repository and must not be uploaded or copied into Git.

Commands (device address intentionally elided):

~~~sh
ssh venue 'bluetoothctl --version; bluetoothctl list; bluetoothctl show'
ssh venue 'bluetoothctl devices Paired; bluetoothctl devices Connected'
ssh venue 'bluetoothctl info <locally-resolved-device-address>'
ssh venue 'curl -fsS --max-time 3 http://127.0.0.1:8094/status'
ssh venue 'pactl list cards; pactl list short sinks; wpctl status'
~~~

No Bluetooth discovery scan was started. The local API /status route was inspected in source and only reads state/device info; mutating routes were not invoked.
