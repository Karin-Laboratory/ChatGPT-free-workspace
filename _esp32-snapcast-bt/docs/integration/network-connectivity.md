# Network connectivity observations

調査日時 2026-10-20 07:22 JST。raspi2 was used as requested for connectivity checks. The server address was supplied by the user; this public file uses a placeholder to avoid publishing private LAN details.

## From raspi2

Short TCP connect attempts (1 s each) to the user-specified Snapserver host on candidate ports 1704, 1705 and 1780 each timed out. A read-only JSON-RPC POST to /jsonrpc on the HTTP candidate port also timed out. The host provided no HTTP status or response. Timeout does not distinguish routing, firewall filtering, host power, or service configuration.

Local command/result summary:

~~~text
raspi2 SSH: reachable
Snapserver TCP candidate ports: all TimeoutError
JSON-RPC GET/POST candidate: URL timeout
~~~

mDNS was not queried because avahi-browse is not installed on raspi2; discovery remains UNKNOWN. Official current Snapcast config documents _snapcast._tcp, _snapcast-ctrl._tcp and _snapcast-http._tcp service types, but this server's publication is unverified. No stream or service was changed. These tests establish only that this raspi2 session could not complete connections at the observation time; they say nothing about the Pico's future Wi-Fi reachability.

## SSH fallback

Existing alias homeaudio-40-vm was inspected first. The configured hostname is homeaudio-40-vm on port 22, but DNS resolution failed. Using the alias configuration with the explicitly supplied target address as HostName reached SSH but authentication returned Permission denied. No alternate username, key, password or privilege escalation was attempted. Server-side systemctl status/cat and ss -lntp therefore remain uncollected.

Reproduction (replace placeholder with the host value in an untracked local config):

~~~sh
ssh raspi2 'python3 -c "import socket; s=socket.create_connection((SNAPSERVER_HOST,PORT),timeout=1)"'
ssh homeaudio-40-vm 'hostname; date -Is'
ssh -o HostName=SNAPSERVER_HOST homeaudio-40-vm 'hostname; date -Is'
~~~
