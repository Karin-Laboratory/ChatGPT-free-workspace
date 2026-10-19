# 偽Pico USB／ハードウェア調査

- 調査日時：2026-10-20 06:26 JST（2026-10-19 21:26 UTC）
- 接続先：SSH alias `raspi2`、ユーザー `codex`（既存 `~/.ssh/config` の設定を使用）
- 保存先：`Karin-Laboratory/ChatGPT-free-workspace` `main`
- 調査方式：読み取り専用。ファームウェア書き込み／消去／リセット、BOOTSELへの移行、USBストレージのマウント、シリアルポートのオープン、SWD操作はしていない。

## 要約

raspi2からUSB機器 `2e8a:0003` が `Raspberry Pi RP2 Boot` として観測された。USB記述子と128 MiBのRPI-RP2ブートボリュームを持つマスストレージから、RP2系ブートローダーのBOOTSELモードであることを**CONFIRMED（USB動作モード）**とする。これはUSBだけでMCUの真正性を認証したことを意味しない。

以前の設計メモにある「RP2040 revision B2、フラッシュ2 MiB」は今回の個体で照合できていない。USBシリアル `E0C9125B0D9B` は記録したが、以前の測定個体のシリアルが設計メモにないため、同一個体かも未確認。RP2 BOOTSELの仮想ディスク容量128 MiBは実フラッシュ容量ではない。

無線チップ、アンテナ、RP2040相当MCUと無線部の配線はUSBから確認できない。Wi-FiおよびBluetoothは**UNKNOWN**。無線なしのRP2040単体ならSnapcastのWi-Fi受信もBluetooth A2DP送信もできない。適合したCYW43439と基板配線を確認できれば技術的な実験余地はあるが、現状では実現可能と判定できない。

## raspi2の環境

実行コマンド：

```sh
uname -a
cat /proc/device-tree/model
cat /etc/os-release
```

実出力（関連部分）：

```text
Linux raspi2 6.18.50+rpt-rpi-v7 #1 SMP Raspbian 1:6.18.50-1+rpt1 (2026-09-11) armv7l GNU/Linux
Raspberry Pi 2 Model B Rev 1.1
PRETTY_NAME="Raspbian GNU/Linux 13 (trixie)"
VERSION_ID="13"
VERSION_CODENAME=trixie
DEBIAN_VERSION_FULL=13.6
```

## USB接続状況

実行コマンド：

```sh
lsusb
lsusb -t
lsusb -d 2e8a:0003 -v
udevadm info --query=all --path=/sys/bus/usb/devices/1-1.4
ls -l /dev/ttyACM* /dev/ttyUSB* 2>/dev/null
lsblk -o NAME,TYPE,SIZE,RO,RM,FSTYPE,LABEL,MOUNTPOINTS /dev/sdb
grep -E "sdb|RPI-RP2" /proc/mounts
dmesg | grep -E "1-1\\.4|RP2|2e8a|sdb" | tail -n 50
```

実出力（対象機器と必要な関連情報のみ）：

```text
Bus 001 Device 037: ID 2e8a:0003 Raspberry Pi RP2 Boot
Bus 001 Device 036: ID 1a86:7523 QinHeng Electronics CH340 serial converter

/:  Bus 001.Port 001: Dev 001, Class=root_hub, Driver=dwc_otg/1p, 480M
    |__ Port 001: Dev 002, Class=Hub, Driver=hub/5p, 480M
        |__ Port 004: Dev 037, If 0, Class=Mass Storage, Driver=usb-storage, 12M
        |__ Port 004: Dev 037, If 1, Class=Vendor Specific Class, Driver=[none], 12M
        |__ Port 005: Dev 036, If 0, Class=Vendor Specific Class, Driver=ch341, 12M

idVendor           0x2e8a Raspberry Pi
idProduct          0x0003 RP2 Boot
bcdDevice            1.00
iManufacturer           1 Raspberry Pi
iProduct                2 RP2 Boot
iSerial                 3 E0C9125B0D9B
bNumConfigurations      1
bNumInterfaces          2
Interface 0: Mass Storage / SCSI / Bulk-Only
Interface 1: Vendor Specific Class
MaxPower 500mA

E: ID_VENDOR=Raspberry_Pi
E: ID_MODEL=RP2_Boot
E: ID_SERIAL_SHORT=E0C9125B0D9B
E: ID_USB_INTERFACES=:080650:ff0000:

/dev/ttyUSB0: present (CH340, driver ch341)
 /dev/ttyACM*: none

NAME   TYPE  SIZE  RO RM FSTYPE LABEL   MOUNTPOINTS
sdb    disk  128M   0  1
└─sdb1 part  128M   0  1 vfat   RPI-RP2
```

`/proc/mounts` にRPI-RP2/sdbはなく、調査時点で未マウント。容量表示はブートローダーが公開する仮想UF2ドライブであり、2 MiBフラッシュの測定値ではない。ストレージ内容は読んでいない。

CH340はRP2 Bootとは別のUSBハブポート（RP2は1-1.4、CH340は1-1.5）に列挙されている。CH340記述子はVID/PID `1a86:7523`、Product `USB Serial`、シリアル記述子なし、ドライバー `ch341`。これが当該基板上のUARTに接続されているか、どのピンに配線されているかは未確認。UARTを開くとDTR/RTS等で基板をリセットする可能性があるため、今回は開いていない。

raspi2のdmesgでは調査時刻にUSBデバイス037が `2e8a:0003` として新規認識され、usb-storageが登録され、`sdb` と `RPI-RP2` パーティションが作成された。udev情報でもManufacturer/Product/Serialとインターフェースが一致した。無関係なUSB機器のログや識別子は記録から除外した。

## ハードウェア判定

| 項目 | 判定 | 根拠／制約 |
|---|---|---|
| USBデバイス | **CONFIRMED**（列挙情報） | VID:PID `2e8a:0003`、Raspberry Pi / RP2 Boot、USB serial `E0C9125B0D9B`。記述子は模倣可能なので、これ単独でシリコンの真正性は認証できない。 |
| USB動作モード | **CONFIRMED** | RP2 Boot、マスストレージ＋ベンダー固有IF、RPI-RP2仮想ボリュームが観測された。現在のユーザーファームウェアは動作しておらず、BOOTSELブートローダー側にいる。こちらからBOOTSELへ移行させてはいない。 |
| MCUがRP2040であること | **INFERRED** | RP2ブートローダーのUSB表記と既知の基板履歴はRP2040を示唆する。ただし今回USB越しにROM/チップIDを照会していないため、直接確認ではない。 |
| RP2040 revision B2 | **UNKNOWN（今回未照合）** | USB記述子にはrevision情報がない。既存記録のB2がこのUSBシリアルの個体か確認できない。 |
| 外付けフラッシュ2 MiB | **UNKNOWN（今回未照合）** | USBから容量を読む安全で非状態変更の照会をしていない。128 MiB仮想UF2ドライブは容量根拠にならない。 |
| USB bootloader種類 | **CONFIRMED（RP2系）** | `RP2 Boot` のUSB descriptorとUF2マスストレージ。ブートローダーの細かなビルド／由来は未確認。 |
| 現在のアプリUSB機能 | **未確認／該当なし** | アプリは動作中でなくブートローダーモード。ブートローダーのUSB IFをアプリ機能と取り違えない。 |
| SWD | **UNKNOWN** | USB列挙からは分からない。SWD操作は未実施。パッドの有無も写真・実物で未確認。 |

## Wi-Fi／Bluetooth

| 項目 | 判定 | 根拠 |
|---|---|---|
| Pico W互換基板 | **UNKNOWN** | 外観・基板型番・部品配置を確認していない。USB descriptorはPico Wと偽Picoを区別しない。 |
| CYW43439等の無線チップ | **UNKNOWN** | USB一覧に無線デバイスはないが、CYW43439はRP2040からSPI接続され、USBに独立デバイスとして現れる必要はない。USB不在をチップ不在の証拠にできない。 |
| Wi-Fi機能 | **UNKNOWN** | USBブートモードにはWi-Fi機能が見えていない。これは基板上の無線部と配線の有無を判定しない。 |
| Bluetooth Classic/A2DP | **UNKNOWN（本機）** | USBから搭載有無・配線・ファームウェア対応を確認できない。 |
| RP2040単体の無線 | **利用不可** | RP2040自体にはWi-Fi/Bluetooth無線がない。実現には対応無線チップとその配線が必要。 |

**レベルの意味：** CONFIRMED = 実機から直接観測、INFERRED = 状況証拠による推定、UNKNOWN = 判定不能。

公式資料によれば、純正Pico WのCYW43439は2.4 GHz Wi-FiとBluetooth 5.2（ClassicおよびBLE）を備え、Wi-FiとBluetoothの通信はRP2040との共通3線SPIを使う。これは純正Pico Wの仕様であり、今回のクローンに部品や配線がある証拠ではない。[Raspberry Pi: New functionality: Bluetooth for Pico W](https://www.raspberrypi.com/news/new-functionality-bluetooth-for-pico-w/)

## Snapcast→Bluetooth適合性

- **Wi-FiでSnapserverへ接続：** 無線部が未確認なので現時点では不可判定。対応CYW43439等が実装・配線され、ドライバーが初期化できることが前提。
- **PCM受信／バッファリング：** RP2040相当のSRAMは264 KiB。48 kHz、16-bit、ステレオPCMは192,000 byte/sで、PCMだけで100 msが約19.2 kB、500 msが約96 kB。Snapcastプロトコル、Wi-Fi/TCP、BTstack、A2DP/SBC、スタック、ヒープも同じ資源を消費する。短いバッファなら設計上の余地はあるが、長いジッタ吸収と同時無線処理は厳しく、RAM計測と実機ドロップアウト試験が必要。
- **Bluetooth Classic A2DP Source：** 純正Pico W相当のCYW43439ハードウェアと対応BTstack構成が確認されれば候補。Arduino-PicoはA2DP Source APIを文書化している。現個体の機能としては未確認であり、A2DPを利用できると断定しない。[Arduino-Pico: A2DP](https://arduino-pico.readthedocs.io/en/latest/a2dp.html)
- **Wi-Fi＋Bluetooth同時利用：** 純正Pico Wの公式実装は共通SPIバス上で両方の通信を実現するが、クローンの接続・ドライバー・スケジューリングが同じとは限らない。Snapcastを加えた実時間性能は特に未検証。
- **SDK選択：** 無線対応が確認できるまでは選定・実装を始めない。無線搭載が確認できた場合、A2DP音源の最短検証はArduino-Pico、低レベルの同時無線／メモリ制御はPico SDK＋BTstackが候補。RP2040＋BTstackだけでは無線ハードウェアを補えない。

### 結論

今回観測したUSBモードからはSnapcast Bluetoothレシーバーとしての実現可否は確定しない。無線部がなければ単体実現は不可能。CYW43439等があり、Pico W相当のSPI配線を持つと確認できれば、A2DPとWi-Fiの個別動作は技術候補となるが、Snapcast受信との共存、SRAM、音切れ、スピーカー遅延は未検証で、プロジェクト全体は**条件付き・高リスク**。

## 未解決事項と次の安全な実験

1. 基板の表裏を撮影し、基板シルク、シールド缶・無線チップ刻印、アンテナ形状、フラッシュ刻印、SWDパッドを読み取る。写真で隠れている箇所は実物と照合する。
2. 以前のB2／2 MiB調査ログと当時のUSB固有シリアルを探し、`E0C9125B0D9B` と照合する。一致しない／記録がない場合は別個体として扱う。
3. 写真・部品刻印から無線チップ候補が判明した後に、回路図または導通確認でRP2040のSPI、制御、割り込み、電源、アンテナ配線を確認する。通電中のピン操作は避け、実験前に電圧レベルとピン割当を確定する。
4. SWDパッドの位置と配線を写真／回路図で確認するだけに留める。フラッシュ読み出しを行うなら、電圧・端子・接続ツールを確認した上で、書き込み・消去コマンドを無効化した読み出し専用手順を別途設計する。本調査では未実施。
5. 無線と配線が確認されてから、Wi-Fi接続、A2DP Source接続、両者同時動作、Snapcast PCM受信の順に、秘密情報をログやGitへ残さず、各段階でRAM余裕・切断・再接続・遅延を測る。現時点でフラッシュや消去を伴う実験は行わない。

## 既存メモの修正点

`_esp32-snapcast-bt/README.md` の「targetでRP2040 rev B2、2 MiB flashを確認済み」という表現は、今回のUSB個体との同一性と容量を確認できたかのように読めるため修正した。現状は「以前の調査で報告されたが、今回のUSB個体では未再確認」とする。Pico WのBluetooth Classic対応は公式仕様であり、クローンへの搭載・配線は未確認という区別は維持する。
