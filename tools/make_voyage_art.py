"""The Voyage of Odysseus: cut the Nano Banana pictures (art/raw/) into game/assets/voyage/.
Run: python tools/make_voyage_art.py   (then python tools/manifest.py)

Each prop is saved at the size the game drew its placeholder, so the scenes need no new sizes.
Tiles are made even (no dark edges) so they repeat without seams.
"""
import os, sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
RAW = os.path.join(ROOT, 'art', 'raw')
OUT = os.path.join(ROOT, 'game', 'assets', 'voyage')
_src = open(os.path.join(ROOT, 'tools', 'cutout.py'), encoding='utf-8').read().split("src, out = sys.argv[1]")[0]
exec(_src)  # brings in cut()


def cells(name, rows, cols, inset=0.025):
    im = Image.open(os.path.join(RAW, name)).convert('RGB')
    W, H = im.size
    cw, ch = W / cols, H / rows
    out = []
    for r in range(rows):
        for c in range(cols):
            ix, iy = int(cw * inset), int(ch * inset)
            t = cut(im.crop((int(c * cw) + ix, int(r * ch) + iy, int((c + 1) * cw) - ix, int((r + 1) * ch) - iy)), 0)
            out.append(t.crop(t.getbbox()))
    return out


def fit(im, w, h):
    """Scale to fit inside w x h, keep the proportions."""
    s = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


def save(im, name, w=None, h=None):
    if w:
        im = fit(im, w, h or w)
    im.save(os.path.join(OUT, name + '.png'), optimize=True)
    return im


def even_light(im):
    """Take away big light and dark areas (a tile with dark edges shows seams), keep the small details."""
    a = np.asarray(im).astype(float)
    blur = np.asarray(im.filter(ImageFilter.GaussianBlur(im.width / 8))).astype(float)
    mean = a.reshape(-1, 3).mean(0)
    b = np.clip(a - blur + mean, 0, 255).astype(np.uint8)
    return Image.fromarray(b)


def keep_near_part(im):
    """A ring seen from the side (the scarf): drop the far side above the hole, keep the front band and the ends."""
    a = np.array(im)
    clear = a[..., 3] < 60
    h, w = clear.shape
    out = np.zeros_like(clear)
    q = deque([(y, x) for y in range(h) for x in (0, w - 1) if clear[y, x]] + [(y, x) for x in range(w) for y in (0, h - 1) if clear[y, x]])
    for y, x in q:
        out[y, x] = True
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and clear[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True
                q.append((ny, nx))
    hole = clear & ~out
    cols = np.where(hole.any(axis=0))[0]
    if len(cols):
        x0, x1 = cols.min(), cols.max()
        for x in range(w):
            xc = min(max(x, x0), x1)
            top = np.where(hole[:, xc])[0].max()   # everything above the bottom of the hole is the far side
            a[:top + 2, x, 3] = 0
    t = Image.fromarray(a)
    return t.crop(t.getbbox())


def main():
    os.makedirs(OUT, exist_ok=True)
    # ---- tiles (512 x 512; the game shows them at half size) ----
    for n in ['sea', 'storm', 'sand', 'cave', 'deck', 'cliff']:
        im = Image.open(os.path.join(RAW, f'tile_{n}.jfif')).convert('RGB')
        if n in ('cave', 'deck'):
            im = even_light(im)
        im = im.resize((512, 512), Image.LANCZOS)
        if n == 'cave':   # its edges don't continue: four mirrored copies always fit together
            q = im.resize((256, 256), Image.LANCZOS)
            im = Image.new('RGB', (512, 512))
            im.paste(q, (0, 0)); im.paste(q.transpose(Image.FLIP_LEFT_RIGHT), (256, 0))
            im.paste(q.transpose(Image.FLIP_TOP_BOTTOM), (0, 256)); im.paste(q.transpose(Image.ROTATE_180), (256, 256))
        im.save(os.path.join(OUT, f'tile_{n}.jpg'), quality=88)
    # ---- sheep: 3 rows x 2 columns ----
    sh = cells('voyage_sheep.jfif', 3, 2)
    for im, n in zip(sh, ['sheep_white_black', 'sheep_white_white', 'sheep_grey_black', 'bell', 'sheep_grey_white', 'boulder']):
        save(im, n, 300 if n.startswith('sheep') else (90 if n == 'bell' else 260))
    # ---- pigs: rows pink / brown / spotted, columns sleeping / apple / mud; all turned to face right ----
    looks_left = {(1, 2), (2, 1), (2, 2)}
    pg = cells('voyage_pigs.jfif', 3, 3)
    for k, im in enumerate(pg):
        r, c = divmod(k, 3)
        if (r, c) in looks_left:
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        save(im, f"pig_{['pink', 'brown', 'spotted'][r]}_{['sleep', 'apple', 'mud'][c]}", 340, 260)
    # ---- the scarf: only the part you would see on a neck ----
    sc = cut(Image.open(os.path.join(RAW, 'voyage_scarf.jfif')).convert('RGB'), 0)
    save(keep_near_part(sc.crop(sc.getbbox())), 'scarf', 200)
    # ---- sailors ----
    for k, im in enumerate(cells('voyage_sailors.jfif', 2, 2, 0.03)):
        save(im, f'sailor_{k + 1}', 260)
    # ---- islands for the map ----
    for im, n in zip(cells('voyage_islands.jfif', 2, 4, 0.03), ['troy', 'lotus', 'cyclops', 'circe', 'sirens', 'strait', 'ithaca', 'smallrock']):
        save(im, 'isle_' + n, 520)
    # ---- props at sea (sizes of the old drawings) ----
    p1 = cells('voyage_props1.jfif', 3, 3)
    sizes1 = [('rock', 160, 120), ('rock_bird', 110, 110), ('rock_tree', 110, 110), ('rock_flag', 110, 110), ('rock_shell', 110, 110),
              ('bottle', 64, 64), ('whirl', 240, 240), ('wave', 300, 160), ('bolt', 110, 260)]
    for im, (n, w, h) in zip(p1, sizes1):
        save(im, n, w, h)
    # ---- props on the islands ----
    p2 = cells('voyage_props2.jfif', 3, 3)
    sizes2 = [('palm', 150, 190), ('pond', 220, 130), ('boat', 210, 130), ('lotus', 90, 70), ('well', 120, 130), ('house', 300, 260),
              ('fence', 120, 90), ('box', 100, 90), ('cavemouth', 180, 160)]
    for im, (n, w, h) in zip(p2, sizes2):
        save(im, n, w, h)
    # ---- Circe's garden ----
    pl = cells('voyage_plants.jfif', 2, 3)
    for im, n in zip(pl, ['flower_white', 'flower_yellow', 'flower_red', 'flower_purple', 'root', 'soup']):
        save(im, n, 200)
    print('voyage art saved in', OUT)


if __name__ == '__main__':
    main()
