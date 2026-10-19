#!/usr/bin/env python3
"""Read-only Snapserver preflight. No external packages; never touches Pico/BT."""
import argparse
import json
import sys
import urllib.error
import urllib.request


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--host", required=True, help="Snapserver hostname/IP, supplied locally")
    p.add_argument("--port", type=int, default=1780)
    p.add_argument("--stream", default="HomeAudio")
    p.add_argument("--codec", default="flac")
    p.add_argument("--timeout", type=float, default=4)
    a = p.parse_args()
    if a.port < 1 or a.port > 65535 or a.timeout <= 0:
        p.error("invalid port or timeout")
    endpoint = f"http://{a.host}:{a.port}/jsonrpc"
    body = json.dumps({"id": 1, "jsonrpc": "2.0", "method": "Server.GetStatus"}).encode()
    req = urllib.request.Request(endpoint, data=body, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=a.timeout) as resp:
            payload = json.load(resp)
    except (OSError, ValueError, urllib.error.HTTPError) as e:
        print(f"FAIL: JSON-RPC unreachable or invalid: {type(e).__name__}", file=sys.stderr)
        return 2
    if payload.get("error"):
        print("FAIL: Server.GetStatus returned error", file=sys.stderr)
        return 2
    server = payload.get("result", {}).get("server", {})
    streams = server.get("streams", [])
    selected = [s for s in streams if s.get("id") == a.stream]
    if not selected:
        print(f"FAIL: stream {a.stream!r} not found; discovered stream count: {len(streams)}")
        return 1
    stream = selected[0]
    uri = stream.get("uri", {})
    query = uri.get("query", {}) if isinstance(uri, dict) else {}
    observed_codec = query.get("codec") or stream.get("codec")
    observed_codec = str(observed_codec).lower() if observed_codec is not None else None
    observed_status = stream.get("status")
    print(json.dumps({
        "server_version": server.get("version"),
        "stream": a.stream,
        "status": observed_status,
        "codec": observed_codec,
        "sampleformat": query.get("sampleformat"),
        "chunk_ms": query.get("chunk_ms"),
        "note": "Host-only status query; does not establish actual Pico radio capability or Bluetooth audio readiness",
    }, ensure_ascii=False, indent=2))
    if observed_codec != a.codec.lower():
        print(f"FAIL: expected codec {a.codec}, observed {observed_codec}")
        return 1
    if observed_status != "playing":
        print(f"WARNING: status is {observed_status!r}, not playing")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
