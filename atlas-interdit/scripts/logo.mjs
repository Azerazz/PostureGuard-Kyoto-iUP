// Logo « Atlas Interdit » : avatar rond (globe + tampon INTERDIT) et logo texte.
// Usage : node scripts/logo.mjs  →  brand/avatar.png, brand/wordmark.png, brand/cover.png
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import fs from 'fs';

GlobalFonts.registerFromPath('assets/fonts/Montserrat-Black.ttf', 'MBlack');
fs.mkdirSync('brand', { recursive: true });
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json'));
const land = feature(topo, topo.objects.land);

const TURQ = '#2E9CB0', TURQ_D = '#1B6F82', SEA = '#4FB6C6', LAND = '#F1ECE2', RED = '#E8222E', YEL = '#FFD43B';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function globe(ctx, cx, cy, r) {
  const proj = geoOrthographic().rotate([-25, -28]).scale(r).translate([cx, cy]).clipAngle(90);
  const path = geoPath(proj, ctx);
  // halo
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = r * 0.12; ctx.shadowOffsetY = r * 0.05;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = SEA; ctx.fill(); ctx.restore();
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#7FD3DE'); g.addColorStop(1, '#2B8EA3');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); path(geoGraticule10()); ctx.lineWidth = r * 0.006; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = r * 0.03; ctx.shadowOffsetY = r * 0.015;
  ctx.beginPath(); path(land); ctx.fillStyle = LAND; ctx.fill(); ctx.restore();
  // ombrage sphérique
  const sh = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.45, r * 0.2, cx, cy, r * 1.02);
  sh.addColorStop(0, 'rgba(255,255,255,0.25)'); sh.addColorStop(0.6, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,30,50,0.35)');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = sh; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.lineWidth = r * 0.035; ctx.strokeStyle = '#fff'; ctx.stroke();
}

function stamp(ctx, text, cx, cy, size, angle) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
  ctx.font = `${size}px MBlack`; const tw = ctx.measureText(text).width, w = tw + size * 0.8, h = size * 1.45;
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = size * 0.25; ctx.shadowOffsetY = size * 0.08;
  rr(ctx, -w / 2, -h / 2, w, h, size * 0.22); ctx.fillStyle = RED; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = size * 0.07; ctx.strokeStyle = '#fff';
  rr(ctx, -w / 2 + size * 0.14, -h / 2 + size * 0.14, w - size * 0.28, h - size * 0.28, size * 0.12); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, size * 0.05);
  ctx.restore();
}

// ---- Avatar (TikTok l'affiche en rond) ----
{
  const S = 1080, c = createCanvas(S, S), ctx = c.getContext('2d');
  const bg = ctx.createRadialGradient(S / 2, S * 0.4, S * 0.1, S / 2, S / 2, S * 0.75);
  bg.addColorStop(0, TURQ); bg.addColorStop(1, TURQ_D);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S);
  globe(ctx, S / 2, S * 0.47, S * 0.33);
  stamp(ctx, 'INTERDIT', S / 2, S * 0.70, S * 0.105, -0.16);
  fs.writeFileSync('brand/avatar.png', c.toBuffer('image/png'));
  // aperçu en rond à petite taille, comme dans l'appli
  const p = createCanvas(240, 240), px = p.getContext('2d');
  px.beginPath(); px.arc(120, 120, 120, 0, Math.PI * 2); px.clip(); px.drawImage(c, 0, 0, 240, 240);
  fs.writeFileSync('brand/avatar_preview_rond.png', p.toBuffer('image/png'));
}

// ---- Logo texte (transparent) ----
{
  const Wd = 1800, Hd = 620, c = createCanvas(Wd, Hd), ctx = c.getContext('2d');
  globe(ctx, 290, Hd / 2, 230);
  ctx.save(); ctx.font = '210px MBlack'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
  ctx.lineWidth = 26; ctx.strokeStyle = '#141414'; ctx.strokeText('ATLAS', 580, Hd / 2 - 95);
  ctx.shadowColor = 'transparent'; ctx.fillStyle = '#fff'; ctx.fillText('ATLAS', 580, Hd / 2 - 95);
  ctx.restore();
  stamp(ctx, 'INTERDIT', 1120, Hd / 2 + 135, 140, -0.06);
  fs.writeFileSync('brand/wordmark.png', c.toBuffer('image/png'));
}

// ---- Bannière / couverture de série ----
{
  const Wd = 1080, Hd = 1920, c = createCanvas(Wd, Hd), ctx = c.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, Hd); bg.addColorStop(0, TURQ); bg.addColorStop(1, TURQ_D);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, Wd, Hd);
  globe(ctx, Wd / 2, 760, 380);
  stamp(ctx, 'INTERDIT', Wd / 2, 1030, 120, -0.16);
  ctx.font = '150px MBlack'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = 22; ctx.strokeStyle = '#141414'; ctx.strokeText('ATLAS', Wd / 2, 260); ctx.fillStyle = '#fff'; ctx.fillText('ATLAS', Wd / 2, 260);
  ctx.font = '64px MBlack'; ctx.lineWidth = 12; ctx.strokeText('CE QUE PERSONNE', Wd / 2, 1330); ctx.fillText('CE QUE PERSONNE', Wd / 2, 1330);
  ctx.strokeText('NE TE DIT SUR', Wd / 2, 1410); ctx.fillText('NE TE DIT SUR', Wd / 2, 1410);
  ctx.fillStyle = YEL; ctx.strokeText('LES PAYS DU MONDE', Wd / 2, 1490); ctx.fillText('LES PAYS DU MONDE', Wd / 2, 1490);
  fs.writeFileSync('brand/cover.png', c.toBuffer('image/png'));
}
console.log('logos écrits dans brand/');
