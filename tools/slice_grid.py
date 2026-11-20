"""Slice an AI-generated icon grid (e.g. 4x4 on a green screen) into separate transparent icons.

Usage:
  python tools/slice_grid.py <grid image> <rows> <cols> <name1,name2,...> [out_dir] [size]

Names go left-to-right, top-to-bottom; use "-" to skip a cell.
Each icon is cut out, trimmed, padded to a square and saved at 160x160 as <out_dir>/<name>.png.
A contact sheet (<out_dir>/_contact.png) is written so the result can be checked at a glance.
"""
import os, sys
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(__file__))
_src = open(os.path.join(os.path.dirname(__file__), 'cutout.py'), encoding='utf-8').read().split("src, out = sys.argv[1]")[0]
exec(_src)  # brings in cut()

SIZE = 256

def main():
    path, rows, cols, names = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4].split(',')
    out_dir = sys.argv[5] if len(sys.argv) > 5 else 'game/assets/icons'
    global SIZE
    if len(sys.argv) > 6: SIZE = int(sys.argv[6])   # optional icon size (power of two), e.g. 512 for big characters
    os.makedirs(out_dir, exist_ok=True)
    grid = Image.open(path).convert('RGB')
    cw, ch = grid.width / cols, grid.height / rows
    saved = []
    for i, name in enumerate(names):
        if name == '-' or i >= rows * cols:
            continue
        r, c = divmod(i, cols)
        cell = grid.crop((round(c * cw), round(r * ch), round((c + 1) * cw), round((r + 1) * ch)))
        icon = cut(cell, 0)
        bb = icon.getbbox()
        if not bb:
            print('empty cell', i, name); continue
        icon = icon.crop(bb)
        side = max(icon.size)
        sq = Image.new('RGBA', (side, side))
        sq.paste(icon, ((side - icon.width) // 2, (side - icon.height) // 2))
        sq = sq.resize((SIZE, SIZE), Image.LANCZOS)
        sq.save(os.path.join(out_dir, name + '.png'), optimize=True)
        saved.append((name, sq))
    # contact sheet on a dark background to reveal halos
    sheet = Image.new('RGBA', (cols * (SIZE + 10), ((len(saved) + cols - 1) // cols) * (SIZE + 30)), (30, 40, 70, 255))
    d = ImageDraw.Draw(sheet)
    for k, (name, im) in enumerate(saved):
        x, y = (k % cols) * (SIZE + 10), (k // cols) * (SIZE + 30)
        sheet.alpha_composite(im, (x, y)); d.text((x + 4, y + SIZE + 6), name, fill=(255, 255, 255, 255))
    sheet.save(os.path.join(out_dir, '_contact.png'))
    print(f'saved {len(saved)} icons to {out_dir}')

if __name__ == '__main__':
    main()
