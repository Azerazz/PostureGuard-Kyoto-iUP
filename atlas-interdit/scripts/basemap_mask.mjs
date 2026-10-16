// Rasterise le masque des terres (Natural Earth 10m) dans la projection de mapmeta.
import { createCanvas } from '@napi-rs/canvas';
import { geoArea, geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import fs from 'fs';
import { MAP_W, MAP_H, PX_PER_RAD, TX, TY } from './mapmeta.mjs';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-10m.json'));
const land = feature(topo, topo.objects.land);
// On retire l'Antarctique et les anneaux mal orientés (aire ≈ sphère entière) qui inversent le remplissage.
land.features.forEach((f) => {
  if (f.geometry.type === 'MultiPolygon')
    f.geometry.coordinates = f.geometry.coordinates.filter(
      (poly) => poly[0].some(([, lat]) => lat > -60) && geoArea({ type: 'Polygon', coordinates: poly }) < 2 * Math.PI);
});
const proj = geoMercator().scale(PX_PER_RAD).translate([TX, TY]);
const c = createCanvas(MAP_W, MAP_H), ctx = c.getContext('2d');
ctx.fillStyle = '#000'; ctx.fillRect(0, 0, MAP_W, MAP_H);
ctx.fillStyle = '#fff'; ctx.beginPath(); geoPath(proj, ctx)(land); ctx.fill();
fs.writeFileSync('build/landmask.png', c.toBuffer('image/png'));
console.log('masque', MAP_W, MAP_H);
fs.writeFileSync('build/mapmeta.json', JSON.stringify({ MAP_W, MAP_H, PX_PER_RAD, TX, TY }));
