import io
import json
import unittest
from unittest.mock import patch
from scripts import preflight


class FakeHTTP(io.BytesIO):
    def __enter__(self):
        return self
    def __exit__(self, *args):
        self.close()


class PreflightTest(unittest.TestCase):
    def _run(self, codec="flac"):
        data = {"result": {"server": {"version": "0.31.0", "streams": [
            {"id": "HomeAudio", "status": "playing",
             "uri": {"query": {"codec": codec, "sampleformat": "48000:16:2", "chunk_ms": "20"}}}
        ]}}}
        with patch("sys.argv", ["preflight.py", "--host", "localhost"]), patch(
                "urllib.request.urlopen", return_value=FakeHTTP(json.dumps(data).encode())):
            return preflight.main()

    def test_success(self):
        self.assertEqual(self._run(), 0)

    def test_codec_mismatch(self):
        self.assertEqual(self._run("pcm"), 1)


if __name__ == "__main__":
    unittest.main()
