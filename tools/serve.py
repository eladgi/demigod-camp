"""Local server for the game folder.
- tells the browser never to cache, so changes show up on a normal reload
- listens on IPv4 and IPv6, so "localhost" answers instantly on Windows
- refreshes assets/manifest.json (the list of art files that exist) on start
Usage: python tools/serve.py [port]"""
import http.server, functools, os, socket, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from manifest import write_manifest

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()
    def log_message(self, *a):
        pass

class DualStack(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6
    def server_bind(self):
        try: self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except Exception: pass
        super().server_bind()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game')
write_manifest()
print(f'Game running at http://localhost:{port}/index.html')
DualStack(('::', port), functools.partial(NoCache, directory=root)).serve_forever()
