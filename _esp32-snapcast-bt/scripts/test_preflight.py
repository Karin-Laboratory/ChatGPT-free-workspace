import io
import json
import unittest
from contextlib import redirect_stderr, redirect_stdout
from unittest.mock import patch
from scripts import preflight


class FakeHTTP(io.BytesIO):
    def __enter__(self):
        return self
    def __exit__(self, *args):
        self.close()


class PreflightTest(unittest.TestCase):
    def _run(self, codec="flac"):
        data = {"result": {"server": {"server": {"snapserver": {"version": "0.31.0"}}, "streams": [
            {"id": "HomeAudio", "status": "playing",
             "uri": {"query": {"codec": codec, "sampleformat": "48000:16:2", "chunk_ms": "20"}}}
        ]}}}
        output = io.StringIO()
        with patch("sys.argv", ["preflight.py", "--host", "localhost"]), patch(
                "urllib.request.urlopen", return_value=FakeHTTP(json.dumps(data).encode())), \
                redirect_stdout(output), redirect_stderr(io.StringIO()):
            result = preflight.main()
        return result, output.getvalue()

    def test_success(self):
        self.assertEqual(self._run()[0], 0)

    def test_codec_mismatch(self):
        self.assertEqual(self._run("pcm")[0], 1)

    def test_nested_live_server_version(self):
        result, output = self._run()
        self.assertEqual(result, 0)
        self.assertEqual(json.loads(output)["server_version"], "0.31.0")


if __name__ == "__main__":
    unittest.main()
