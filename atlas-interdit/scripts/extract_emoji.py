"""Extrait des emojis Noto individuels depuis le sprite @svgmoji/noto."""
import re, sys
src = open('node_modules/@svgmoji/noto/sprites/all.svg', encoding='utf-8').read()
ids = sys.argv[1:]
for eid in ids:
    m = re.search(r'<svg[^>]*id="%s"[^>]*>' % re.escape(eid), src)
    if not m:
        print('absent', eid); continue
    i, depth = m.end(), 1
    for t in re.finditer(r'<svg\b|</svg>', src[i:]):
        depth += 1 if t.group() == '<svg' else -1
        if depth == 0:
            end = i + t.end(); break
    body = src[m.start():end]
    body = body.replace('<svg', '<svg width="512" height="512"', 1)
    if 'xmlns:xlink' not in body.split('>')[0]:
        body = body.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"', 1)
    open(f'assets/emoji/{eid}.svg', 'w').write(body)
    print('ok', eid, len(body))
