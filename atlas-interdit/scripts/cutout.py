"""Télécharge les photos choisies (Openverse) et les détoure avec BiRefNet (rembg)."""
import io, json, sys, urllib.request
from PIL import Image
from rembg import new_session, remove
UA = {'User-Agent': 'AtlasInterdit/0.1'}
PICKS = {  # nom de l'objet : (planche, index)
    'knife': ('knife', 4), 'chrys': ('chrys', 9), 'bouquet': ('bouquet2', 9), 'bag': ('bag', 0),
    'clock': ('clock', 8), 'shoes': ('shoes', 10), 'gift': ('gift', 15), 'gift_hook': ('gift', 8),
    'umbrella': ('umbrella', 10), 'coin': ('coin', 0),
}
only = sys.argv[1:] or list(PICKS)
session = new_session('birefnet-general')
credits = json.load(open('assets/objects/credits.json')) if __import__('os').path.exists('assets/objects/credits.json') else {}
for name in only:
    sheet, idx = PICKS[name]
    r = json.load(open(f'build/ov_{sheet}.json'))[idx]
    raw = urllib.request.urlopen(urllib.request.Request(r['url'], headers=UA), timeout=60).read()
    im = Image.open(io.BytesIO(raw)).convert('RGB'); im.thumbnail((1600, 1600))
    out = remove(im, session=session)
    out = out.crop(out.getbbox())
    out.save(f'assets/objects/{name}.png')
    credits[name] = {'title': r.get('title'), 'creator': r.get('creator'), 'license': r['license'],
                     'license_version': r.get('license_version'), 'source': r.get('foreign_landing_url')}
    print('ok', name, out.size, r['license'])
json.dump(credits, open('assets/objects/credits.json', 'w'), ensure_ascii=False, indent=1)
