"""Construit la carte de fond façon « carte qui raconte » : mer turquoise, terres claires en relief."""
import json, math
import numpy as np
from PIL import Image, ImageFilter
Image.MAX_IMAGE_PIXELS = None
m = json.load(open('build/mapmeta.json'))
W, H, S, TX, TY = m['MAP_W'], m['MAP_H'], m['PX_PER_RAD'], m['TX'], m['TY']

sr = np.asarray(Image.open('assets/map/SR_HR.tif'), dtype=np.float32)  # 21600x10800, équirectangulaire
SH, SW = sr.shape
xs = np.arange(W); ys = np.arange(H)
lon = np.degrees((xs - TX) / S)
lat = np.degrees(2 * np.arctan(np.exp(-(ys - TY) / S)) - math.pi / 2)
sx = np.clip(((lon + 180) / 360 * SW).astype(int), 0, SW - 1)
sy = np.clip(((90 - lat) / 180 * SH).astype(int), 0, SH - 1)
relief = sr[sy][:, sx] / 206.0          # 1.0 = plat, <1 ombre, >1 lumière
del sr
mask = np.asarray(Image.open('build/landmask.png').convert('L'), dtype=np.float32) / 255
mask_img = Image.fromarray((mask * 255).astype(np.uint8))
shallow = np.asarray(mask_img.filter(ImageFilter.GaussianBlur(40)), dtype=np.float32) / 255

# Mer : turquoise profond → plus clair près des côtes
deep = np.array([38, 132, 156], np.float32); light = np.array([92, 190, 200], np.float32)
t = np.clip(shallow * 2.2, 0, 1)[..., None]
sea = deep * (1 - t) + light * t
# Terres : gris chaud très clair, relief accentué
land_base = np.array([236, 232, 224], np.float32)
r = np.clip(1 + (relief - 1) * 1.6, 0.35, 1.25)[..., None]
land = np.clip(land_base * r, 0, 255)
# Légère bordure claire sur la côte
coast = np.asarray(mask_img.filter(ImageFilter.GaussianBlur(3)), dtype=np.float32) / 255
edge = (np.clip(coast * (1 - mask) * 3, 0, 1))[..., None]
sea = sea * (1 - edge * 0.35) + 255 * edge * 0.35
a = mask[..., None]
img = land * a + sea * (1 - a)
# grain léger
noise = np.random.default_rng(1).normal(0, 2.0, (H, W, 1)).astype(np.float32)
img = np.clip(img + noise, 0, 255).astype(np.uint8)
Image.fromarray(img).save('build/basemap.jpg', quality=92)
Image.fromarray(img).resize((W // 8, H // 8)).save('build/basemap_preview.jpg')
print('ok', W, H)
