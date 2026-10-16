"""Planche contact de photos Openverse à licence permissive (CC0, PDM, CC BY)."""
import io, json, sys, time, urllib.parse, urllib.request
from PIL import Image, ImageDraw
UA = {'User-Agent': 'AtlasInterdit/0.1'}
name, queries = sys.argv[1], sys.argv[2:]
cands, seen = [], set()
for q in queries:
    url = 'https://api.openverse.org/v1/images/?' + urllib.parse.urlencode(
        {'q': q, 'license': 'cc0,pdm,by', 'category': 'photograph', 'page_size': 20})
    try:
        res = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30))['results']
    except Exception as e:
        print('erreur', q, e); continue
    for r in res:
        if r['id'] in seen: continue
        seen.add(r['id'])
        try:
            raw = urllib.request.urlopen(urllib.request.Request(r['thumbnail'], headers=UA), timeout=20).read()
            r['img'] = Image.open(io.BytesIO(raw)).convert('RGB'); cands.append(r)
        except Exception:
            pass
    time.sleep(1)
cands = cands[:30]
cell = 200
sheet = Image.new('RGB', (cell * 6, (cell + 24) * ((len(cands) + 5) // 6 or 1)), (30, 30, 30))
dr = ImageDraw.Draw(sheet)
for i, r in enumerate(cands):
    im = r.pop('img'); im.thumbnail((cell - 8, cell - 8))
    x, y = (i % 6) * cell, (i // 6) * (cell + 24)
    sheet.paste(im, (x + 4, y + 4))
    dr.text((x + 4, y + cell), f"{i} {r['license']} {r.get('width')}x{r.get('height')}", fill='white')
sheet.save(f'build/ov_{name}.png')
json.dump(cands, open(f'build/ov_{name}.json', 'w'), ensure_ascii=False, indent=1)
print(name, len(cands))
