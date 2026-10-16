"""Cherche des PNG transparents sur Wikimedia Commons et affiche licence + miniature."""
import json, sys, time, urllib.error, urllib.parse, urllib.request
UA = {'User-Agent': 'AtlasInterdit/0.1 (video pipeline; contact via github)'}
def api(**p):
    p.update(format='json')
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(p)
    for attempt in range(6):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA)))
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(8 * (attempt + 1))
    raise SystemExit('429 persistant')
q = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 12
r = api(action='query', generator='search', gsrsearch=q + ' filemime:image/png', gsrnamespace=6, gsrlimit=n,
        prop='imageinfo', iiprop='url|size|extmetadata', iiurlwidth=400)
for page in sorted(r.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 0)):
    ii = page['imageinfo'][0]; md = ii.get('extmetadata', {})
    lic = md.get('LicenseShortName', {}).get('value', '?')
    print(json.dumps({'title': page['title'], 'lic': lic, 'w': ii['width'], 'h': ii['height'],
                      'thumb': ii.get('thumburl'), 'url': ii['url'],
                      'artist': md.get('Artist', {}).get('value', '')[:80]}, ensure_ascii=False))
