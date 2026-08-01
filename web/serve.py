#!/usr/bin/env python3
"""Static file server with HTTP Range support, for the CheerpJ page.

`python3 -m http.server` does NOT implement Range requests -- it ignores the
header and returns 200 with the entire body. CheerpJ fetches Game.jar with
range requests and cannot parse the archive when a full body comes back where
it expected a 206, which surfaces as:

    Error: Could not find or load main class Madness

Serve the repository root (this script chdir's there itself), then open
http://localhost:8000/web/

    python3 web/serve.py [port]
"""

import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RANGE_RE = re.compile(r"^bytes=(\d*)-(\d*)$")


class _Limited:
    """Wraps a file object so copyfile() stops after n bytes."""

    def __init__(self, f, n):
        self.f, self.n = f, n

    def read(self, amt=-1):
        if self.n <= 0:
            return b""
        if amt is None or amt < 0:
            amt = self.n
        data = self.f.read(min(amt, self.n))
        self.n -= len(data)
        return data

    def close(self):
        self.f.close()


class RangeHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        # The jar gets rebuilt constantly during porting work; never cache it.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        rng = self.headers.get("Range")
        if not rng:
            return super().send_head()
        m = RANGE_RE.match(rng.strip())
        if not m:
            return super().send_head()

        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        size = os.fstat(f.fileno()).st_size
        start_s, end_s = m.group(1), m.group(2)
        if start_s == "":
            # Suffix form: "bytes=-N" means the final N bytes.
            if end_s == "":
                f.close()
                self.send_error(400, "Bad Range")
                return None
            length = min(int(end_s), size)
            start, end = size - length, size - 1
        else:
            start = int(start_s)
            end = int(end_s) if end_s else size - 1
            end = min(end, size - 1)

        if start >= size or start > end:
            f.close()
            self.send_response(416)
            self.send_header("Content-Range", "bytes */%d" % size)
            self.end_headers()
            return None

        f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        return _Limited(f, end - start + 1)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    print("serving %s on http://localhost:%d/  -- open /web/" % (root, port))
    ThreadingHTTPServer(("127.0.0.1", port), RangeHandler).serve_forever()
