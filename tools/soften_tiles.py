"""Hermes Express ground tiles: a softer, sunnier grass (less contrast and colour, so the things standing on it
read clearly) and a slightly calmer path. Run again after replacing art/raw/hermes_grass.jfif or hermes_path.jfif."""
import os
from PIL import Image, ImageEnhance

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
raw = lambda n: os.path.join(ROOT, 'art', 'raw', n)
out = lambda n: os.path.join(ROOT, 'game', 'assets', 'hermes', n)

im = Image.open(raw('hermes_grass.jfif')).convert('RGB').resize((512, 512), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(0.55)
im = ImageEnhance.Color(im).enhance(0.98)
im = ImageEnhance.Brightness(im).enhance(1.28)
im = Image.blend(im, Image.new('RGB', im.size, (150, 210, 90)), 0.16)
im.save(out('grass.png'), optimize=True)

p = Image.open(raw('hermes_path.jfif')).convert('RGB').resize((512, 512), Image.LANCZOS)
ImageEnhance.Contrast(p).enhance(0.8).save(out('path.png'), optimize=True)
print('grass and path saved')
