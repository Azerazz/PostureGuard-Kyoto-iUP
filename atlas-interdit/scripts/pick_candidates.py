"""Rassemble des candidats PNG transparents à licence permissive et crée une planche contact."""
import io, json, subprocess, sys, time, urllib.request
from PIL import Image, ImageDraw
UA = {'User-Agent': 'AtlasInterdit/0.1 (video pipeline; contact via github)'}
OK = ('public domain', 'cc0', 'cc by 1', 'cc by 2', 'cc by 3', 'cc by 4', 'pd')
name, queries = sys.argv[1], sys.argv[2:]
seen, cands = set(), []
for q in queries:
    out = subprocess.run(['python3', 'scripts/commons_search.py', q, '40'], capture_output=True, text=True).stdout
    for d in map(json.loads, filter(None, out.splitlines())):
        lic = d['lic'].lower()
        if d['title'] in seen or not lic.startswith(OK) or '-sa' in lic or 'sa ' in lic: continue
        seen.add(d['title'])
        try:
            raw = urllib.request.urlopen(urllib.request.Request(d['thumb'], headers=UA), timeout=20).read()
            im = Image.open(io.BytesIO(raw)).convert('RGBA')
        except Exception as e:
            continue
        a = im.split()[3]; w, h = im.size
        corners = [a.getpixel(p) for p in [(1, 1), (w - 2, 1), (1, h - 2), (w - 2, h - 2)]]
        if max(corners) > 10 or a.getextrema()[0] > 0: continue  # pas de vraie transparence
        d['img'] = im; cands.append(d)
        time.sleep(0.5)
    time.sleep(3)
cands = cands[:24]
cell = 220
sheet = Image.new('RGB', (cell * 6, (cell + 30) * ((len(cands) + 5) // 6 or 1)), (60, 160, 180))
dr = ImageDraw.Draw(sheet)
for i, d in enumerate(cands):
    im = d.pop('img'); im.thumbnail((cell - 10, cell - 10))
    x, y = (i % 6) * cell, (i // 6) * (cell + 30)
    sheet.paste(im, (x + 5, y + 5), im)
    dr.text((x + 5, y + cell), f"{i} {d['lic'][:12]}", fill='white')
sheet.save(f'build/cands_{name}.png')
json.dump(cands, open(f'build/cands_{name}.json', 'w'), ensure_ascii=False, indent=1)
print(name, len(cands))
