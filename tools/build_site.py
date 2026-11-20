"""Build the website copy of the game (for GitHub Pages) in site/.

  python tools/build_site.py

- copies only game/ (never the project root, so .env.local with the ElevenLabs key can't come along)
- leaves out files the game does not use (contact sheets, test pages, review tools)
- writes the art list (assets/manifest.json) for exactly the files that were copied
- scans every copied text file for anything that looks like a key, and stops if it finds one
- keeps site/.git and site/CNAME, so updating is: run this, then commit and push in site/
"""
import json, os, re, shutil, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'game')
DST = os.path.join(ROOT, 'site')
KEEP_IN_SITE = {'.git', 'CNAME', '.gitignore', '.nojekyll', 'README.md', 'LICENSE'}

# not part of the game
SKIP_NAMES = {'review_hats.html', 'hydra.html', 'sea_bg.gif', 'hydra_head_idle.png', '_contact.png', 'Thumbs.db', '.DS_Store'}
SKIP_EXT = {'.jfif', '.psd', '.py', '.mjs', '.bat'}
# what a secret could look like
SECRET = [re.compile(p) for p in [r'sk_[0-9a-fA-F]{20,}', r'ELEVENLABS_API_KEY\s*[=:]', r'xi-api-key', r'-----BEGIN [A-Z ]*PRIVATE KEY-----']]
TEXT_EXT = {'.html', '.js', '.json', '.css', '.txt', '.md', '.svg'}


def skip(name):
    return name in SKIP_NAMES or name.startswith('.env') or os.path.splitext(name)[1].lower() in SKIP_EXT


def main():
    os.makedirs(DST, exist_ok=True)
    # clear the old copy (but keep git, the domain file and the git settings)
    for n in os.listdir(DST):
        if n in KEEP_IN_SITE:
            continue
        p = os.path.join(DST, n)
        shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    copied = []
    for dirpath, dirnames, filenames in os.walk(SRC):
        dirnames[:] = [d for d in dirnames if not d.startswith('.')]
        for f in filenames:
            if skip(f):
                continue
            src = os.path.join(dirpath, f)
            rel = os.path.relpath(src, SRC).replace('\\', '/')
            dst = os.path.join(DST, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            copied.append(rel)
    # the art list: only files that are really in the site
    man = os.path.join(DST, 'assets', 'manifest.json')
    if os.path.exists(man):
        have = set(copied)
        items = [p for p in json.load(open(man, encoding='utf-8')) if p in have]
        json.dump(items, open(man, 'w', encoding='utf-8'))
    # GitHub Pages: serve files as they are (no Jekyll), and keep secrets out of git even if one is added by mistake
    open(os.path.join(DST, '.nojekyll'), 'w').close()
    gi = os.path.join(DST, '.gitignore')
    if not os.path.exists(gi):
        open(gi, 'w').write('.env*\n*.key\nnode_modules/\n')
    # the secret scan
    found = []
    for rel in copied:
        if os.path.splitext(rel)[1].lower() not in TEXT_EXT:
            continue
        text = open(os.path.join(DST, rel), encoding='utf-8', errors='ignore').read()
        for pat in SECRET:
            if pat.search(text):
                found.append((rel, pat.pattern))
    size = sum(os.path.getsize(os.path.join(DST, r)) for r in copied)
    print(f'{len(copied)} files, {size / 1048576:.1f} MB in site/')
    if found:
        for rel, pat in found:
            print('POSSIBLE SECRET in', rel, '(pattern', pat + ')')
        print('STOPPED: do not publish until this is fixed.')
        sys.exit(1)
    print('secret scan: clean')


if __name__ == '__main__':
    main()
