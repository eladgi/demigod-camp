"""Find the separate objects on a green-screen image (when Gemini didn't keep to an even grid) and save each one.

Usage:
  python tools/split_objects.py <image> [--list]
      prints every object found: number, position and size (left to right, top to bottom)
  python tools/split_objects.py <image> <out_dir> <n1=name1> <n2=name2> ...
      saves object number n as <out_dir>/<name>.png (trimmed, transparent)
"""
import os, sys
import numpy as np
from PIL import Image

_src = open(os.path.join(os.path.dirname(__file__), 'cutout.py'), encoding='utf-8').read().split("src, out = sys.argv[1]")[0]
exec(_src)  # brings in cut()

def objects(path):
    full = cut(Image.open(path), 0)
    a = np.array(full)[..., 3] > 40
    # find blobs on a small copy (fast), then map the boxes back to full size
    k = 4
    small = a[::k, ::k]
    h, w = small.shape
    seen = np.zeros_like(small, dtype=bool)
    boxes = []
    for y in range(h):
        for x in range(w):
            if small[y, x] and not seen[y, x]:
                stack = [(y, x)]; seen[y, x] = True
                y0 = y1 = y; x0 = x1 = x; n = 0
                while stack:
                    cy, cx = stack.pop(); n += 1
                    y0, y1, x0, x1 = min(y0, cy), max(y1, cy), min(x0, cx), max(x1, cx)
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = cy + dy, cx + dx
                            if 0 <= ny < h and 0 <= nx < w and small[ny, nx] and not seen[ny, nx]:
                                seen[ny, nx] = True; stack.append((ny, nx))
                if n > 200:   # ignore specks (steam wisps etc. get merged below)
                    boxes.append([x0 * k, y0 * k, (x1 + 1) * k, (y1 + 1) * k])
    # merge boxes that overlap or almost touch (e.g. steam above a river)
    merged = True
    while merged:
        merged = False
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                A, B = boxes[i], boxes[j]
                if A[0] - 30 < B[2] and B[0] - 30 < A[2] and A[1] - 30 < B[3] and B[1] - 30 < A[3]:
                    boxes[i] = [min(A[0], B[0]), min(A[1], B[1]), max(A[2], B[2]), max(A[3], B[3])]
                    boxes.pop(j); merged = True; break
            if merged: break
    boxes.sort(key=lambda b: (round(b[1] / 300), b[0]))
    return full, boxes

if __name__ == '__main__':
    full, boxes = objects(sys.argv[1])
    if len(sys.argv) == 2 or sys.argv[2] == '--list':
        for i, b in enumerate(boxes): print(i, 'x', b[0], 'y', b[1], 'size', b[2] - b[0], 'x', b[3] - b[1])
        sys.exit()
    out = sys.argv[2]; os.makedirs(out, exist_ok=True)
    for pair in sys.argv[3:]:
        n, name = pair.split('=')
        b = boxes[int(n)]
        im = full.crop(b); im = im.crop(im.getbbox())
        im.save(os.path.join(out, name + '.png'), optimize=True)
        print(name, im.size)
