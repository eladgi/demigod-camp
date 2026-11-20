"""Hermes' Shop head things: turn the Nano Banana sheet (art/raw/shop_hats.jfif, 3 rows x 4 columns:
rows front / side / back, columns flowers / wreath / tiara / crown) into pictures that look WORN.

The sheet shows whole rings (you see the far side of the ring too). On a head the far side is hidden behind the
head, so each picture keeps only the part you would really see:
  flowers  ring seen from above   -> the near arc (a garland across the hair)
  tiara    front/back: wall seen from below -> the wall, without the far rim under it; side: the near band with the star
  crown    front/back: the wall without the opening and the far rim under it; side: whole
  (the sheet's wreath column is not used: the laurel wreath was taken out of the shop)
Writes game/assets/shop/<name>_<view>.png and a contact sheet. Run: python tools/make_hats.py
"""
import os, sys
from collections import deque
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
_src = open(os.path.join(ROOT, 'tools', 'cutout.py'), encoding='utf-8').read().split("src, out = sys.argv[1]")[0]
exec(_src)  # brings in cut()

OUT = os.path.join(ROOT, 'game', 'assets', 'shop')
NAMES = ['flowers', 'wreath', 'tiara', 'crown']
VIEWS = ['front', 'side', 'back']


def cells():
    im = Image.open(os.path.join(ROOT, 'art', 'raw', 'shop_hats.jfif')).convert('RGB')
    W, H = im.size
    cw, ch = W / 4, H / 3
    ins = int(cw * 0.02)
    out = {}
    for r, v in enumerate(VIEWS):
        for c, n in enumerate(NAMES):
            t = cut(im.crop((int(c * cw) + ins, int(r * ch) + ins, int((c + 1) * cw) - ins, int((r + 1) * ch) - ins)), 0)
            out[n, v] = t.crop(t.getbbox())
    return out


def flood(mask, seeds):
    """All pixels of mask connected to the seeds."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    q = deque()
    for y, x in seeds:
        if 0 <= y < h and 0 <= x < w and mask[y, x] and not seen[y, x]:
            seen[y, x] = True
            q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


def hole(a):
    """The opening of a ring: the biggest see-through area that the outside cannot reach."""
    clear = a[..., 3] < 60
    h, w = clear.shape
    border = [(y, x) for y in range(h) for x in (0, w - 1)] + [(y, x) for x in range(w) for y in (0, h - 1)]
    inside = clear & ~flood(clear, border)
    best, done = None, np.zeros_like(inside)
    for y, x in zip(*np.where(inside)):
        if not done[y, x]:
            comp = flood(inside, [(y, x)])
            done |= comp
            if best is None or comp.sum() > best.sum():
                best = comp
    return best


def crown_inside(a):
    """The opening of the crown seen from below is painted (dark brown inside wall): find it by colour."""
    r, g, b, al = (a[..., i].astype(int) for i in range(4))
    brown = (al > 200) & (r > 60) & (r < 175) & (g < 115) & (b < 60) & (r - b > 40)
    h, w = brown.shape
    seeds = [(int(h * f), int(w * k)) for f in (0.72, 0.78, 0.84) for k in (0.4, 0.5, 0.6)]
    return flood(brown, seeds)


def keep(im, region, part, margin=14, grow=3, trim_ends=True):
    """Keep only the part of the ring ABOVE the opening ('upper') or BELOW it ('lower'), per column."""
    a = np.array(im)
    h, w = region.shape
    cols = np.where(region.any(axis=0))[0]
    x0, x1 = cols.min(), cols.max()
    top = {x: np.where(region[:, x])[0].min() for x in cols}
    bot = {x: np.where(region[:, x])[0].max() for x in cols}
    for x in range(max(0, x0 - margin), min(w, x1 + margin + 1)):
        xc = min(max(x, x0), x1)
        if part == 'upper':
            a[max(0, top[xc] - grow):, x, 3] = 0       # the opening and everything under it (the far rim)
        else:
            a[:min(h, bot[xc] + grow), x, 3] = 0       # the opening and everything over it (the far arc)
    # the two ends of the ring: stop at the middle height of the opening (no legs hanging down / stubs sticking up),
    # with a soft edge so the end tucks behind the head instead of looking chopped
    if not trim_ends:
        out = Image.fromarray(a)
        return out.crop(out.getbbox())
    mid = int(max(top[x0], top[x1]))
    al = a[..., 3].astype(float)
    rows = np.arange(h)[:, None]
    fade = np.clip((mid + 4 - rows) / 10, 0, 1) if part == 'upper' else np.clip((rows - (mid - 4)) / 10, 0, 1)
    a[..., 3] = (al * fade).astype(np.uint8)
    out = Image.fromarray(a)
    return out.crop(out.getbbox())


def wreath(branch, view):
    """Laurel: one branch (stem low on the left, tip high on the right) -> a wreath as it sits on a head."""
    if view == 'side':
        b = branch.rotate(-24, expand=True, resample=Image.BICUBIC)   # flatter: it lies along the side of her head
        return b.crop(b.getbbox())
    b = branch.rotate(-26, expand=True, resample=Image.BICUBIC)     # flatter, so it lies around the head
    b = b.crop(b.getbbox())
    m = b.transpose(Image.FLIP_LEFT_RIGHT)
    w, h = b.size
    over = int(w * 0.1)
    out = Image.new('RGBA', (w * 2 - over, h), (0, 0, 0, 0))
    if view == 'front':      # tips meet in the middle of the forehead
        out.alpha_composite(b, (0, 0))
        out.alpha_composite(m, (w - over, 0))
    else:                    # back: stems meet in the middle, tips go around to the front
        out.alpha_composite(m, (0, 0))
        out.alpha_composite(b, (w - over, 0))
    return out.crop(out.getbbox())


def main():
    c = cells()
    res = {}
    for v in VIEWS:
        res['flowers', v] = keep(c['flowers', v], hole(np.array(c['flowers', v])), 'lower')
    res['tiara', 'front'] = keep(c['tiara', 'front'], hole(np.array(c['tiara', 'front'])), 'upper')
    res['tiara', 'back'] = keep(c['tiara', 'back'], hole(np.array(c['tiara', 'back'])), 'upper')
    res['tiara', 'side'] = keep(c['tiara', 'side'], hole(np.array(c['tiara', 'side'])), 'lower', trim_ends=False)   # the star stands above the middle
    res['crown', 'front'] = keep(c['crown', 'front'], crown_inside(np.array(c['crown', 'front'])), 'upper')
    res['crown', 'back'] = keep(c['crown', 'back'], hole(np.array(c['crown', 'back'])), 'upper')
    res['crown', 'side'] = c['crown', 'side']

    os.makedirs(OUT, exist_ok=True)
    sheet = Image.new('RGBA', (4 * 260, 3 * 200), (60, 70, 90, 255))
    for (n, v), im in res.items():
        im.thumbnail((320, 320), Image.LANCZOS)
        im.save(os.path.join(OUT, f'{n}_{v}.png'), optimize=True)
        p = im.copy()
        p.thumbnail((240, 180))
        sheet.alpha_composite(p, (NAMES.index(n) * 260 + 10, VIEWS.index(v) * 200 + 10))
        print(n, v, im.size)
    sheet.save(os.path.join(ROOT, 'art', 'hats_worn_contact.png'))


if __name__ == '__main__':
    main()
