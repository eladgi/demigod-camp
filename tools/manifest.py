"""Write game/assets/manifest.json: every file under game/assets, so the games only load art that exists.
Run after adding art (the art scripts and serve.py call it automatically)."""
import json, os

GAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game')

def write_manifest():
    assets = os.path.join(GAME, 'assets')
    files = []
    for d, _, names in os.walk(assets):
        for n in names:
            if n.startswith('_') or n.endswith('_preview.png') or n == 'manifest.json':
                continue
            files.append(os.path.relpath(os.path.join(d, n), GAME).replace('\\', '/'))
    with open(os.path.join(assets, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(sorted(files), f, indent=0)
    return len(files)

if __name__ == '__main__':
    print('manifest:', write_manifest(), 'files')
