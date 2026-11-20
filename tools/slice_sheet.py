"""Turn an AI-generated animation grid (e.g. 4 rows x 4 frames on a green screen) into a clean sprite sheet.

Usage:
  python tools/slice_sheet.py <grid image> <rows> <cols> <out.png> [frame_size]

Every cell is cut out and trimmed, then all frames are scaled by ONE common factor and pasted
bottom-centered into equal square frames, so the character doesn't jump or change size between frames.
Writes <out.png> (cols x rows frames) and <out>_preview.png on a dark background for checking.
"""
import os, sys
from PIL import Image

_src = open(os.path.join(os.path.dirname(__file__), 'cutout.py'), encoding='utf-8').read().split("src, out = sys.argv[1]")[0]
exec(_src)  # brings in cut()

def main():
    path, rows, cols, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
    size = int(sys.argv[5]) if len(sys.argv) > 5 else 160
    grid = Image.open(path).convert('RGB')
    cw, ch = grid.width / cols, grid.height / rows
    frames = []
    for r in range(rows):
        for c in range(cols):
            cell = grid.crop((round(c * cw), round(r * ch), round((c + 1) * cw), round((r + 1) * ch)))
            im = cut(cell, 0)
            bb = im.getbbox()
            frames.append(im.crop(bb) if bb else Image.new('RGBA', (1, 1)))
    # one scale for all frames: the biggest frame fills the cell with a small margin
    big = max(max(f.width, f.height) for f in frames)
    k = (size * 0.94) / big
    sheet = Image.new('RGBA', (cols * size, rows * size))
    for i, f in enumerate(frames):
        f = f.resize((max(1, round(f.width * k)), max(1, round(f.height * k))), Image.LANCZOS)
        r, c = divmod(i, cols)
        sheet.paste(f, (c * size + (size - f.width) // 2, r * size + size - f.height - 2), f)
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    sheet.save(out, optimize=True)
    prev = Image.new('RGBA', sheet.size, (30, 40, 70, 255)); prev.alpha_composite(sheet)
    prev.save(os.path.splitext(out)[0] + '_preview.png')
    print(f'{out}: {rows}x{cols} frames of {size}px')

if __name__ == '__main__':
    main()
