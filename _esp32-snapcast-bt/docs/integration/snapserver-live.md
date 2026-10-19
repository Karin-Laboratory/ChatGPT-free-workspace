# Snapserver live inspection

- 調査日時: 2026-10-20 07:22 JST
- 調査範囲: 既存Snapserverの状態取得。設定変更・再起動・ストリーム追加なし。
- ホスト: 依頼文に指定されたプライベートアドレス宛てを raspi2 から試行。値は公開設定例に記載しない。

## 実施と結果

raspi2から各TCPポートへ1秒timeoutの接続試験を実行:

~~~text
TCP audio candidate: timeout
TCP JSON-RPC candidate: timeout
HTTP/Web UI candidate: timeout
~~~

HTTP JSON-RPC read request: POST Server.GetStatus to the requested /jsonrpc path; result timeout, no HTTP status or response body. これはポートが閉じている証拠ではなく、経路/Firewall/host停止/サービス不在を区別できない。

SSH設定には候補alias homeaudio-40-vm があるが、設定上のhostnameがDNS解決不能。明示されたSnapserver IPをalias設定に一時指定して読み取りSSHを試したが、SSH認証がPermission denied。別ユーザー、別鍵、password試行はしていない。従って以下はすべて未取得:

- Snapserver version、hostname、server name
- 実listen portとWeb UI/JSON-RPC path
- live stream ID/name/status/codec/sample format/channels/chunk_ms
- server buffer、client list/latency、time-sync settings
- mDNS広告
- systemctl status/cat, ss -lntp, snapserver config

再現コマンド（target addressはprivateなのでプレースホルダー）:

~~~sh
ssh raspi2 'python3 -c "import socket; s=socket.create_connection((SNAPSERVER_HOST,PORT),timeout=1)"'
curl -fsS --max-time 3 -H 'Content-Type: application/json' -d '{"id":1,"jsonrpc":"2.0","method":"Server.GetStatus"}' http://SNAPSERVER_HOST:HTTP_PORT/jsonrpc
ssh homeaudio-40-vm 'hostname; date -Is; snapserver --version'
ssh -o HostName=SNAPSERVER_HOST homeaudio-40-vm 'hostname; snapserver --version'
~~~

実際に候補として調べたポートは1704/1705/1780。現行Snapcastの公開設定例ではTCP audio 1704、TCP control 1705、HTTP 1780がdefault候補で、mDNS typeは _snapcast._tcp / _snapcast-ctrl._tcp / _snapcast-http._tcp と記載される。ただし稼働機は接続できず、ポート変更/無効化やbind先を確認できないため、実測設定とは区別する。参考: [upstream snapserver.conf](https://github.com/snapcast/snapcast/blob/develop/server/etc/snapserver.conf)。raspi2にはavahi-browseがなく、mDNS query自体は実行できなかった。今回確認できなかったため、ファームウェア設定の実測値として扱わない。既存資料に引用されたpipe URI (chunk_ms=20, codec=flac, HomeAudio, 48000:16:2) は過去記録にすぎず、現行stream設定とは認定しない。

## 結論

既存streamを変更せずにPCM用追加streamが作れるかはUNKNOWN。serverからの設定ファイル読み取り権限が回復した後、現設定とstream plugin/source supportを確認する。追加streamは作成していない。
