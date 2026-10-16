"""Assemble des aperçus en planche : python3 scripts/sheet.py ep01 t1,t2,..."""
import sys
from PIL import Image
ep, times = sys.argv[1], [float(x) for x in sys.argv[2].split(',')]
w, h, cols = 270, 480, 6
s = Image.new('RGB', (w * cols, h * ((len(times) + cols - 1) // cols)))
for i, t in enumerate(times):
    s.paste(Image.open(f'build/{ep}/preview/f_{t:.2f}.jpg').resize((w, h)), ((i % cols) * w, (i // cols) * h))
s.save(f'build/{ep}/sheet.jpg')
