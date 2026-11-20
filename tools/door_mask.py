"""Find the empty doorway in a house picture and save a white door that fills it exactly (the game tints it).

Usage: python tools/door_mask.py <house.png> <out.png> <seed_x> <seed_y>
seed = a point inside the doorway (fractions 0..1 of the picture)."""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

src, out, sx, sy = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
im = Image.open(src).convert('RGBA'); a = np.array(im).astype(int)
h, w = a.shape[:2]
lum = a[..., :3].mean(2); sat = a[..., :3].max(2) - a[..., :3].min(2)
m = (a[..., 3] > 200) & (lum > 35) & (lum < 150) & (sat < 45)
# the green-screen cut can leave a hole in the doorway: see-through pixels that the outside can't reach count as doorway too
clear = a[..., 3] < 200
out_ = np.zeros_like(clear); q = deque()
for y in range(h):
    for x in (0, w - 1):
        if clear[y, x] and not out_[y, x]: out_[y, x] = True; q.append((y, x))
for x in range(w):
    for y in (0, h - 1):
        if clear[y, x] and not out_[y, x]: out_[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and clear[ny, nx] and not out_[ny, nx]:
            out_[ny, nx] = True; q.append((ny, nx))
m |= clear & ~out_
# nearest doorway pixel to the seed
ys, xs = np.where(m); px, py = sx * w, sy * h
i = np.argmin((xs - px) ** 2 + (ys - py) ** 2); seed = (ys[i], xs[i])
seen = np.zeros_like(m); seen[seed] = True; q = deque([seed])
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not seen[ny, nx]:
            seen[ny, nx] = True; q.append((ny, nx))
ys, xs = np.where(seen)
# below the dark part the doorway may be see-through down to the ground: fill each column down to the wall's bottom line
x0, x1 = xs.min(), xs.max()
def bottom(x):   # lowest solid pixel of the house in column x
    col = np.where(a[:, x, 3] > 200)[0]; return col.max() if len(col) else None
bl, br = bottom(max(0, x0 - 12)), bottom(min(w - 1, x1 + 24))
for x in range(x0, x1 + 1):
    col = np.where(seen[:, x])[0]
    if not len(col): continue
    yb = int(bl + (br - bl) * (x - (x0 - 12)) / (x1 + 36 - x0)) - 4
    for y in range(col.max() + 1, yb):
        if a[y, x, 3] < 200 or (lum[y, x] < 60): seen[y, x] = True
        else: break
ys, xs = np.where(seen)
print('doorway', xs.min(), xs.max(), ys.min(), ys.max(), 'pixels', len(xs))
mask = Image.fromarray((seen * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
# a white door with soft shading: lighter in the middle, a darker edge, a knob
door = np.zeros((h, w, 4), np.uint8); door[..., :3] = 255
md = np.array(mask) > 0
edge = md & ~(np.array(mask.filter(ImageFilter.MinFilter(9))) > 0)
door[md, :3] = 235; door[edge, :3] = 150
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
kx, ky = int(x0 + (x1 - x0) * 0.25), int(y0 + (y1 - y0) * 0.6)
yy, xx = np.ogrid[:h, :w]; knob = ((yy - ky) ** 2 + (xx - kx) ** 2 <= 36) & md
door[knob, :3] = 60
door[..., 3] = np.array(mask)
Image.fromarray(door).save(out, optimize=True)
