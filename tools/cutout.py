"""Remove solid green/magenta backgrounds from AI images -> trimmed transparent PNGs.
Usage: python tools/cutout.py <in> <out.png> [max_height]
For a GIF, writes a horizontal sprite sheet and prints frame info."""
import sys, numpy as np
from PIL import Image

def key_mask(rgb, bg):
    a = rgb.astype(np.int32); r,g,b = a[...,0],a[...,1],a[...,2]
    if bg[1] > bg[0] and bg[1] > bg[2]:          # green screen
        dom = g - np.maximum(r, b)
    else:                                          # magenta screen
        dom = np.minimum(r, b) - g
    # strength of "background-ness": 0 = subject, 1 = background
    t = np.clip((dom - 70) / 60.0, 0, 1)
    cand = dom > 70
    # keep only background regions connected to the image border
    conn = np.zeros_like(cand)
    conn[0,:]=cand[0,:]; conn[-1,:]=cand[-1,:]; conn[:,0]=cand[:,0]; conn[:,-1]=cand[:,-1]
    conn |= dom > 125   # enclosed pockets of pure screen color (e.g. inside a tail curl)
    while True:
        n = conn.copy()
        n[1:,:] |= conn[:-1,:]; n[:-1,:] |= conn[1:,:]; n[:,1:] |= conn[:,:-1]; n[:,:-1] |= conn[:,1:]
        n &= cand
        if (n == conn).all(): break
        conn = n
    # edge pixels next to the connected bg get partial alpha
    near = conn.copy()
    for _ in range(2):
        m = near.copy(); m[1:,:]|=near[:-1,:]; m[:-1,:]|=near[1:,:]; m[:,1:]|=near[:,:-1]; m[:,:-1]|=near[:,1:]; near=m
    alpha = np.where(conn, 0.0, np.where(near, 1.0 - t, 1.0))
    return alpha

def despill(rgb, alpha, bg):
    a = rgb.astype(np.float32); r,g,b = a[...,0],a[...,1],a[...,2]
    edge = (alpha < 1) | (alpha > 0)
    if bg[1] > bg[0]:
        g2 = np.minimum(g, np.maximum(r, b) + 25); a[...,1] = np.where(alpha < 0.999, g2, g)
    else:
        lim = g + 25
        a[...,0] = np.where(alpha < 0.999, np.minimum(r, lim), r); a[...,2] = np.where(alpha < 0.999, np.minimum(b, lim), b)
    return a.clip(0,255).astype(np.uint8)

def cut(img, max_h):
    img = img.convert('RGB')
    if max_h and img.height > max_h:
        img = img.resize((round(img.width*max_h/img.height), max_h), Image.LANCZOS)
    rgb = np.array(img); bg = rgb[3,3]
    alpha = key_mask(rgb, bg); rgb = despill(rgb, alpha, bg)
    return Image.fromarray(np.dstack([rgb, (alpha*255).astype(np.uint8)]), 'RGBA')

src, out = sys.argv[1], sys.argv[2]
max_h = int(sys.argv[3]) if len(sys.argv) > 3 else 900
im = Image.open(src)
if getattr(im, 'n_frames', 1) > 1:
    frames = []
    for i in range(im.n_frames):
        im.seek(i); frames.append(cut(im.copy(), max_h))
    box = None
    for f in frames:
        bb = f.getbbox(); box = bb if box is None else (min(box[0],bb[0]),min(box[1],bb[1]),max(box[2],bb[2]),max(box[3],bb[3]))
    frames = [f.crop(box) for f in frames]
    w,h = frames[0].size
    sheet = Image.new('RGBA', (w*len(frames), h))
    for i,f in enumerate(frames): sheet.paste(f, (i*w, 0))
    sheet.save(out, optimize=True)
    print(f'{out}: {len(frames)} frames of {w}x{h}, {im.info.get("duration")}ms each')
else:
    c = cut(im, max_h); c = c.crop(c.getbbox()); c.save(out, optimize=True)
    print(f'{out}: {c.size[0]}x{c.size[1]}')
