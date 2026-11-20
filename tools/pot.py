"""Pad/resize a transparent PNG onto a power-of-two square canvas (256, 512, 1024...).
Power-of-two images let the browser make smooth smaller versions (mipmaps), so they stay sharp when shown small.

Usage: python tools/pot.py <in.png> <out.png> <size> [bottom|center]
The picture keeps its proportions; 'bottom' puts it on the bottom edge filling the full height (for characters).
"""
import sys
from PIL import Image

src, out, size = sys.argv[1], sys.argv[2], int(sys.argv[3])
mode = sys.argv[4] if len(sys.argv) > 4 else 'center'
im = Image.open(src).convert('RGBA')
im = im.crop(im.getbbox())
k = size / max(im.width, im.height) if mode == 'center' else size / im.height
if im.width * k > size: k = size / im.width
im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
canvas = Image.new('RGBA', (size, size))
x = (size - im.width) // 2
y = size - im.height if mode == 'bottom' else (size - im.height) // 2
canvas.paste(im, (x, y), im)
canvas.save(out, optimize=True)
print(out, canvas.size)
