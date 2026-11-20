"""Build a walking sprite sheet from one image per direction.

Usage:
  python tools/build_walk_sheet.py <name> [frame_size]
  e.g.  python tools/build_walk_sheet.py hero      -> reads art/raw/hero_walk_down|left|right|up.*  -> game/assets/sprites/hero_walk.png

Each direction image is a 2x2 grid of walking frames (top-left, top-right, bottom-left, bottom-right).
A single pose (not a grid) also works: it is used for all 4 frames.
If "left" is missing, "right" is mirrored (and the other way around).
All frames get ONE common scale and are pasted bottom-centered, so the character doesn't jump between frames.
Output: 4 rows (down, left, right, up) x 4 frames, plus a _preview.png to check.
"""
import glob, os, sys
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
_src = open(os.path.join(os.path.dirname(__file__), 'cutout.py'), encoding='utf-8').read().split("src, out = sys.argv[1]")[0]
exec(_src)  # brings in cut()
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from manifest import write_manifest

DIRS = ['down', 'left', 'right', 'up']

def frames_from(path):
    im = Image.open(path).convert('RGB')
    # a 2x2 grid if the four quarters each hold a separate figure, otherwise a single pose
    w, h = im.size
    quarters = [im.crop((x, y, x + w // 2, y + h // 2)) for y in (0, h // 2) for x in (0, w // 2)]
    cuts = [cut(q, 0) for q in quarters]
    filled = [c.getbbox() is not None and (c.getbbox()[2] - c.getbbox()[0]) * (c.getbbox()[3] - c.getbbox()[1]) > (w * h) * 0.01 for c in cuts]
    whole = cut(im, 0)
    # if the figure crosses the quarter lines it is a single pose
    bb = whole.getbbox()
    single = bb and (bb[0] < w // 2 < bb[2]) and (bb[1] < h // 2 < bb[3]) and not all(filled)
    if all(filled) and not single:
        return [c.crop(c.getbbox()) for c in cuts]
    one = whole.crop(bb)
    return [one] * 4

def main():
    name = sys.argv[1]
    size = int(sys.argv[2]) if len(sys.argv) > 2 else 256
    found = {}
    for d in DIRS:
        m = glob.glob(os.path.join(ROOT, 'art', 'raw', f'{name}_walk_{d}.*'))
        if m: found[d] = frames_from(m[0])
    if 'left' not in found and 'right' in found: found['left'] = [ImageOps.mirror(f) for f in found['right']]
    if 'right' not in found and 'left' in found: found['right'] = [ImageOps.mirror(f) for f in found['left']]
    missing = [d for d in DIRS if d not in found]
    if missing:
        print('missing directions:', ', '.join(missing)); sys.exit(1)
    # every direction is scaled so the character has the SAME HEIGHT (Gemini draws each image at a different size);
    # within a direction all frames share one scale so the walk doesn't wobble
    target_h = size * 0.92
    scales = {}
    for d in DIRS:
        tallest = sorted(f.height for f in found[d])[len(found[d]) // 2]   # median height of the frames
        k = target_h / tallest
        widest = max(f.width for f in found[d])
        if widest * k > size * 0.98: k = size * 0.98 / widest           # a very wide stride must still fit the frame
        scales[d] = k
    common = min(scales.values()) if any(v < target_h / max(f.height for f in found[d]) * 0.999 for d, v in scales.items()) else None
    if common: scales = {d: common for d in DIRS}  # if one direction had to shrink to fit, shrink all to match
    sheet = Image.new('RGBA', (4 * size, 4 * size))
    for r, d in enumerate(DIRS):
        k = scales[d]
        for c, f in enumerate(found[d]):
            f = f.resize((max(1, round(f.width * k)), max(1, round(f.height * k))), Image.LANCZOS)
            sheet.paste(f, (c * size + (size - f.width) // 2, r * size + size - f.height - 2), f)
    out = os.path.join(ROOT, 'game', 'assets', 'sprites', f'{name}_walk.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sheet.save(out, optimize=True)
    prev = Image.new('RGBA', sheet.size, (30, 40, 70, 255)); prev.alpha_composite(sheet)
    prev.save(out.replace('.png', '_preview.png'))
    write_manifest()
    print('saved', out)

if __name__ == '__main__':
    main()
