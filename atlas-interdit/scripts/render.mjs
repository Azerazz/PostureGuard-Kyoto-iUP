// Moteur de rendu « Atlas Interdit » : carte en relief, drapeaux, avion, objets, sous-titres.
// Usage : node scripts/render.mjs episodes/ep01-cadeaux-interdits.json [--preview t1,t2,...] [--from s --to s]
import { createCanvas, loadImage, GlobalFonts, Path2D } from '@napi-rs/canvas';
import { geoMercator, geoPath, geoBounds, geoCentroid, geoArea } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { spawn } from 'child_process';
import fs from 'fs';
import { PX_PER_RAD, TX, TY, MAP_W, MAP_H } from './mapmeta.mjs';

const W = 1080, H = 1920, FPS = 30;
const args = process.argv.slice(2);
const ep = JSON.parse(fs.readFileSync(args[0], 'utf8'));
const OUT = `build/${ep.id}`;
const tl = JSON.parse(fs.readFileSync(`${OUT}/timeline.json`, 'utf8'));
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };

// ---------- Polices ----------
const F = 'assets/fonts/';
GlobalFonts.registerFromPath(F + 'Montserrat-Black.ttf', 'MBlack');
GlobalFonts.registerFromPath(F + 'Montserrat-ExtraBold.ttf', 'MXBold');
GlobalFonts.registerFromPath(F + 'Caveat.ttf', 'Caveat');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 'CJK');
const font = (px, fam = 'MBlack') => `${px}px ${fam}, CJK`;

// ---------- Utilitaires d'animation ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, d) => clamp((t - a) / d);
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const bounce = (x) => (x >= 1 ? 1 : 1 - Math.exp(-7 * x) * Math.cos(11 * x)); // ressort amorti

// ---------- Carte ----------
const basemap = await loadImage(fs.readFileSync('build/basemap.jpg'));
const proj = geoMercator().scale(PX_PER_RAD).translate([TX, TY]);
const pathStr = geoPath(proj);
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const countries = feature(topo, topo.objects.countries).features;
const borders = new Path2D(pathStr(mesh(topo, topo.objects.countries, (a, b) => a !== b)));

async function loadFlag(code) {
  let svg = fs.readFileSync(`node_modules/flag-icons/flags/4x3/${code}.svg`, 'utf8');
  svg = svg.replace(/<svg([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, '')} width="1600" height="1200">`);
  return loadImage(Buffer.from(svg));
}
async function loadObj(name) {
  if (name.startsWith('emoji:')) return loadImage(fs.readFileSync(`assets/emoji/${name.slice(6)}.svg`));
  return loadImage(fs.readFileSync(`assets/objects/${name}.png`));
}

// Prépare chaque scène : tracé du pays, emprise principale, caméra, drapeau, images
const scenes = [];
for (const [i, s] of ep.scenes.entries()) {
  const f = countries.find((c) => +c.id === s.iso);
  if (!f) throw new Error('pays introuvable ' + s.iso);
  const path = new Path2D(pathStr(f));
  // polygones « principaux » (proches du centre annoncé) pour cadrer sans les territoires d'outre-mer
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const main = polys.filter((p) => {
    const [lon, lat] = geoCentroid({ type: 'Polygon', coordinates: p });
    return Math.hypot(lon - s.center[0], lat - s.center[1]) < 22 && geoArea({ type: 'Polygon', coordinates: p }) < 2 * Math.PI;
  });
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of main) for (const pt of p[0]) {
    if (pt[0] > 165) continue;
    const [x, y] = proj(pt); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  const bw = x1 - x0, bh = y1 - y0;
  const fit = Math.min((W * 0.86) / bw, (H * 0.40) / bh) * (s.zoom || 1);
  const [cx, cy] = proj(s.center);
  scenes.push({
    ...s, i, path, bbox: [x0, y0, x1, y1], cam: { x: s.zoom ? cx : (x0 + x1) / 2, y: s.zoom ? cy : (y0 + y1) / 2, z: fit },
    centerPx: [(x0 + x1) / 2, (y0 + y1) / 2], flagImg: await loadFlag(s.flag), obj: await loadObj(s.image),
    extraImg: s.extra ? await loadObj(s.extra) : null, block: tl.blocks[i + 1],
  });
}
const hookBlock = tl.blocks[0], outroBlock = tl.blocks[tl.blocks.length - 1];
const hookImg = await loadObj(ep.hook.image);
const smallFlags = Object.fromEntries(await Promise.all(scenes.map(async (s) => [s.flag, s.flagImg])));

// Vue large englobant tous les pays
const wide = (() => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const s of scenes) { x0 = Math.min(x0, s.bbox[0]); y0 = Math.min(y0, s.bbox[1]); x1 = Math.max(x1, s.bbox[2]); y1 = Math.max(y1, s.bbox[3]); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + 120;
  return { x: cx, y: cy, z: Math.min((W * 1.05) / (x1 - x0), (H * 0.62) / (y1 - y0)) };
})();

// ---------- Timeline ----------
const T = scenes.map((s) => s.block.lines[0].s);      // début de chaque scène (1re phrase)
const TOUT = outroBlock.lines[0].s;
const TR_PRE = 0.85, TR_POST = 0.6;                   // transition = [T - PRE, T + POST]
const DUR = tl.duration;
const trStart = (k) => (k < scenes.length ? T[k] : TOUT) - TR_PRE;
const trEnd = (k) => (k < scenes.length ? T[k] : TOUT) + TR_POST;

function bezier(a, c, b, u) { return [(1 - u) ** 2 * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]; }
function flight(k) { // trajectoire de l'avion entre la scène k-1 et k
  const a = scenes[k - 1].centerPx, b = scenes[k].centerPx;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return { a, b, c: [mx + (a[1] - b[1]) * 0.18, my - d * 0.22] };
}
function zoomPath(za, zb, zm, u) { // zoom log avec « respiration » au milieu
  const la = Math.log(za), lb = Math.log(zb), lm = Math.log(zm), lc = 2 * lm - 0.5 * (la + lb);
  return Math.exp((1 - u) ** 2 * la + 2 * u * (1 - u) * lc + u * u * lb);
}

function camera(t) {
  // pendant le hook : lente avancée sur la vue large
  if (t < trStart(0)) return { ...wide, z: wide.z * (1 + 0.04 * t / trStart(0)) };
  for (let k = 0; k <= scenes.length; k++) {
    const s0 = trStart(k), s1 = trEnd(k);
    const from = k === 0 ? { ...wide, z: wide.z * 1.04 } : scenes[k - 1].cam;
    const to = k < scenes.length ? scenes[k].cam : wide;
    if (t >= s0 && t < s1) {
      const u = easeInOut((t - s0) / (s1 - s0));
      const plane = k > 0 && k < scenes.length;
      let p;
      if (plane) {
        const fl = flight(k);
        // la caméra suit l'avion, recentrée en douceur vers le cadrage final
        const pp = bezier(fl.a, fl.c, fl.b, u);
        const ca = [from.x, from.y], cb = [to.x, to.y];
        const lin = [lerp(ca[0], cb[0], u), lerp(ca[1], cb[1], u)];
        const w = Math.sin(Math.PI * u);
        p = [lerp(lin[0], pp[0], w * 0.7), lerp(lin[1], pp[1], w * 0.7)];
      } else p = [lerp(from.x, to.x, u), lerp(from.y, to.y, u)];
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const zm = Math.min(from.z, to.z, (W * 0.9) / (dist + 1)) * (plane ? 0.85 : 1);
      return { x: p[0], y: p[1], z: zoomPath(from.z, to.z, Math.min(zm, Math.sqrt(from.z * to.z)), u) };
    }
    // scène k en cours (entre sa transition d'arrivée et la suivante)
    if (k < scenes.length && t >= s1 && t < trStart(k + 1)) {
      const c = scenes[k].cam; return { ...c, z: c.z * (1 + 0.012 * (t - s1)) };
    }
  }
  return { ...wide, z: wide.z * (1 + 0.01 * (t - trEnd(scenes.length))) };
}

function sceneAt(t) { // index de la scène active (-1 = hook, n = outro)
  if (t < trStart(0) + TR_PRE * 0.5) return -1;
  for (let k = scenes.length - 1; k >= 0; k--) if (t >= T[k] - TR_PRE * 0.5) {
    if (t >= TOUT - TR_PRE * 0.5) return scenes.length;
    return k;
  }
  return -1;
}

function flagAlpha(k, t) {
  const s = scenes[k];
  const hookRev = hookBlock.lines[1].s + 0.15 + k * 0.22;
  let a = 0, reveal = 1;
  if (t < trStart(0) + 0.5) a = 0.9 * easeOut(prog(t, hookRev, 0.25)) * (1 - prog(t, trStart(0), 0.5));
  else if (t >= TOUT - 0.3) a = lerp(k < scenes.length ? 0.62 : 0, 0.92, prog(t, TOUT - 0.3, 0.6));
  else if (t >= T[k] + 0.25) {
    reveal = easeOut(prog(t, T[k] + 0.25, 0.55));
    const leaving = k + 1 < scenes.length ? trStart(k + 1) : TOUT;
    a = t < leaving ? 0.93 : lerp(0.93, 0.62, prog(t, leaving, 0.6));
  }
  return { a, reveal };
}

// ---------- Dessin : primitives ----------
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function pill(ctx, text, cx, cy, o = {}) {
  const size = o.size || 40; ctx.font = font(size, o.fam || 'MBlack');
  const tw = ctx.measureText(text).width, px = o.padX ?? size * 0.55, h = size * 1.45;
  const w = tw + px * 2, x = cx - w / 2, y = cy - h / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
  rr(ctx, x, y, w, h, o.radius ?? h / 2.6); ctx.fillStyle = o.bg || '#111'; ctx.fill();
  ctx.shadowColor = 'transparent';
  if (o.border !== false) { ctx.lineWidth = o.borderW || 4; ctx.strokeStyle = o.border || '#fff'; ctx.stroke(); }
  ctx.fillStyle = o.color || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + size * 0.04);
  ctx.restore();
  return w;
}
function strokeText(ctx, text, x, y, size, o = {}) {
  ctx.save();
  ctx.font = font(size, o.fam || 'MBlack'); ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = o.blur ?? 12; ctx.shadowOffsetY = o.dy ?? 6;
  if (o.stroke !== false) { ctx.lineWidth = o.lw || size * 0.16; ctx.strokeStyle = o.strokeColor || '#1a1a1a'; ctx.strokeText(text, x, y); }
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = o.color || '#fff'; ctx.fillText(text, x, y);
  ctx.restore();
}
function fitSize(ctx, text, size, maxW, fam = 'MBlack') {
  ctx.font = font(size, fam); const w = ctx.measureText(text).width;
  return w > maxW ? Math.floor(size * maxW / w) : size;
}
function drawFlagRect(ctx, img, x, y, w, h) {
  ctx.save(); rr(ctx, x, y, w, h, 6); ctx.clip(); ctx.drawImage(img, x, y, w, h); ctx.restore();
  ctx.save(); rr(ctx, x, y, w, h, 6); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.stroke(); ctx.restore();
}
function drawPlane(ctx, x, y, ang, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(30, 0); ctx.quadraticCurveTo(28, -4, 20, -4.5); ctx.lineTo(4, -4.5); ctx.lineTo(-6, -30); ctx.lineTo(-13, -30);
    ctx.lineTo(-7, -4.5); ctx.lineTo(-20, -4); ctx.lineTo(-26, -13); ctx.lineTo(-31, -13); ctx.lineTo(-28, -2.5);
    ctx.lineTo(-30, 0); ctx.lineTo(-28, 2.5); ctx.lineTo(-31, 13); ctx.lineTo(-26, 13); ctx.lineTo(-20, 4); ctx.lineTo(-7, 4.5);
    ctx.lineTo(-13, 30); ctx.lineTo(-6, 30); ctx.lineTo(4, 4.5); ctx.lineTo(20, 4.5); ctx.quadraticCurveTo(28, 4, 30, 0); ctx.closePath();
  };
  ctx.save(); ctx.translate(-8, 14); ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; shape(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#fff'; shape(); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#9aa3ad'; ctx.stroke();
  ctx.restore();
}
function drawObject(ctx, img, cx, baseY, maxW, maxH, o = {}) {
  const k = Math.min(maxW / img.width, maxH / img.height);
  const w = img.width * k, h = img.height * k;
  const drop = o.drop ?? 1, alpha = o.alpha ?? 1;
  const yOff = -(1 - bounce(drop)) * 900;
  // ombre ovale au sol
  ctx.save(); ctx.globalAlpha = alpha * 0.45 * clamp(drop * 1.5);
  const sw = w * 0.62 * (0.6 + 0.4 * clamp(drop * 1.3));
  const g = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, sw);
  g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.translate(cx, baseY); ctx.scale(1, 0.16); ctx.translate(-cx, -baseY);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, baseY, sw, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 25; ctx.shadowOffsetY = 12;
  const sc = o.scale ?? 1;
  ctx.translate(cx, baseY + yOff); ctx.scale(sc, sc);
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
  return { w, h, top: baseY + yOff - h * (o.scale ?? 1) };
}
function stamp(ctx, text, cx, cy, p, size = 64) {
  if (p <= 0) return;
  const sc = lerp(2.4, 1, easeOut(clamp(p * 1.6))), al = clamp(p * 3) * ctx.globalAlpha;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.22); ctx.scale(sc, sc); ctx.globalAlpha = al;
  ctx.font = font(size); const tw = ctx.measureText(text).width, w = tw + 50, h = size * 1.5;
  ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 10;
  rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill();
  ctx.lineWidth = 9; ctx.strokeStyle = '#E8222E'; ctx.stroke();
  rr(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 8); ctx.lineWidth = 3; ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#E8222E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, size * 0.05);
  ctx.restore();
}

// ---------- Sous-titres : découpage en groupes de 2-3 mots ----------
const chunks = [];
for (const b of tl.blocks) for (const line of b.lines) {
  let cur = [];
  const flush = () => { if (cur.length) chunks.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e, lineEnd: line.e }); cur = []; };
  for (const w of line.words) {
    cur.push(w);
    const len = cur.map((x) => x.w).join(' ').length;
    if (/[…,.:?!»]$/.test(w.w) || len >= 15 || cur.length >= 3) flush();
  }
  flush();
}
function drawCaption(ctx, t) {
  let c = null;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i].s - 0.05 && t < (chunks[i + 1] ? Math.min(chunks[i + 1].s - 0.05, chunks[i].lineEnd + 0.3) : chunks[i].lineEnd + 0.3)) c = chunks[i];
  if (!c) return;
  const pop = backOut(prog(t, c.s - 0.05, 0.16));
  const size = 66, gap = 18, y = 1500;
  const words = c.words.map((w) => ({ ...w, txt: w.w.toUpperCase().replace(/[«»]/g, '').trim() })).filter((w) => w.txt);
  ctx.font = font(size);
  const widths = words.map((w) => ctx.measureText(w.txt).width);
  let total = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  const scale = Math.min(1, 900 / total) * lerp(0.85, 1, pop);
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(scale, scale);
  let x = -total / 2;
  words.forEach((w, i) => {
    const cx = x + widths[i] / 2;
    if (w.key) {
      ctx.save(); rr(ctx, x - 12, -size * 0.62, widths[i] + 24, size * 1.24, 14);
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10; ctx.fillStyle = '#E6197C'; ctx.fill(); ctx.restore();
      strokeText(ctx, w.txt, cx, 2, size, { stroke: false, blur: 0, dy: 0 });
    } else strokeText(ctx, w.txt, cx, 2, size, { lw: 13, strokeColor: '#111' });
    x += widths[i] + gap;
  });
  ctx.restore();
}

// ---------- Rendu d'une image ----------
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');

function stampTimes(lines) { return { stampT: lines[0].e - 0.25, tagT: lines[1] ? lines[1].s : lines[0].e + 0.3 }; }

function renderFrame(t) {
  const cam = camera(t);
  // secousse légère au moment des tampons
  let shake = [0, 0];
  for (const s of scenes) {
    const st = stampTimes(s.block.lines).stampT, p = t - st;
    if (p > 0.05 && p < 0.3) { const a = (0.3 - p) * 30; shake = [Math.sin(t * 90) * a, Math.cos(t * 77) * a]; }
  }
  const mx = W / 2 - cam.x * cam.z + shake[0], my = H * 0.5 - cam.y * cam.z + shake[1];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#2b8aa0'; ctx.fillRect(0, 0, W, H);
  // carte de fond (portion visible uniquement)
  const sx = (0 - mx) / cam.z, sy = (0 - my) / cam.z, sw = W / cam.z, sh = H / cam.z;
  const cx0 = clamp(sx, 0, MAP_W), cy0 = clamp(sy, 0, MAP_H), cx1 = clamp(sx + sw, 0, MAP_W), cy1 = clamp(sy + sh, 0, MAP_H);
  if (cx1 > cx0 && cy1 > cy0)
    ctx.drawImage(basemap, cx0, cy0, cx1 - cx0, cy1 - cy0, (cx0 - sx) * cam.z, (cy0 - sy) * cam.z, (cx1 - cx0) * cam.z, (cy1 - cy0) * cam.z);

  ctx.setTransform(cam.z, 0, 0, cam.z, mx, my);
  ctx.lineWidth = 1.6 / cam.z; ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.stroke(borders);

  const active = sceneAt(t);
  // drapeaux dans les pays
  scenes.forEach((s, k) => {
    const { a, reveal } = flagAlpha(k, t);
    if (a <= 0.01) return;
    ctx.save();
    // effet « pays surélevé »
    ctx.globalAlpha = a * 0.6; ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill(s.path); ctx.restore();
    ctx.save(); ctx.clip(s.path);
    if (reveal < 1) {
      const [x0, y0, x1, y1] = s.bbox, r = Math.hypot(x1 - x0, y1 - y0) * 0.6 * reveal;
      ctx.beginPath(); ctx.arc(s.centerPx[0], s.centerPx[1], r, 0, Math.PI * 2); ctx.clip();
    }
    const [x0, y0, x1, y1] = s.bbox, bw = x1 - x0, bh = y1 - y0;
    ctx.globalAlpha = a;
    if (s.flagFit) {
      // drapeau à canton (ex. Taïwan) sur un pays étroit : fond uni + drapeau calé en haut à gauche
      ctx.fillStyle = s.flagFit.bg; ctx.fillRect(x0 - 5, y0 - 5, bw + 10, bh + 10);
      const fw = bw * s.flagFit.width, fh = fw * 0.75;
      ctx.drawImage(s.flagImg, x0 - bw * 0.05, y0, fw, fh);
    } else {
      const k2 = Math.max(bw / 4, bh / 3) * 1.08, fw = 4 * k2, fh = 3 * k2;
      ctx.drawImage(s.flagImg, (x0 + x1) / 2 - fw / 2, (y0 + y1) / 2 - fh / 2, fw, fh);
    }
    ctx.restore();
    if (k === active && reveal > 0) {
      ctx.save(); ctx.globalAlpha = clamp(reveal * 1.5) * (a / 0.93);
      ctx.shadowColor = 'rgba(255,255,255,0.95)'; ctx.shadowBlur = 22;
      ctx.lineWidth = 5 / cam.z; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round'; ctx.stroke(s.path);
      ctx.restore();
    }
  });

  // trajet de l'avion : pointillés jaunes + avion
  for (let k = 1; k < scenes.length; k++) {
    const s0 = trStart(k), s1 = trEnd(k);
    if (t < s0 || t > s1 + 1.6) continue;
    const fl = flight(k), u = easeInOut(clamp((t - s0) / (s1 - s0)));
    const fade = 1 - prog(t, s1 + 0.6, 1.0);
    ctx.save(); ctx.globalAlpha = fade;
    ctx.setLineDash([16 / cam.z, 12 / cam.z]); ctx.lineWidth = 5 / cam.z; ctx.strokeStyle = '#FFE14A';
    ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const p = bezier(fl.a, fl.c, fl.b, (u * i) / 60); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.stroke(); ctx.restore();
    if (t < s1) {
      const p = bezier(fl.a, fl.c, fl.b, u), q = bezier(fl.a, fl.c, fl.b, Math.min(1, u + 0.01));
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      const scr = [p[0] * cam.z + mx, p[1] * cam.z + my];
      const sc = 1.6 * (1 + 0.35 * Math.sin(Math.PI * u)) * (1 - 0.5 * prog(t, s1 - 0.25, 0.25));
      drawPlane(ctx, scr[0], scr[1], Math.atan2(q[1] - p[1], q[0] - p[0]), sc);
      ctx.restore();
    }
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const BASE = 1160;

  // ---------- HOOK ----------
  if (t < trStart(0) + 0.5) {
    const out = prog(t, trStart(0) - 0.1, 0.45);
    const dropT = prog(t, -0.9, 0.9); // déjà posé à la 1re image (miniature)
    drawObject(ctx, hookImg, W / 2, BASE + 20, 640, 560, { drop: Math.max(dropT, 0.0001), alpha: 1 - out, scale: 1 - out * 0.3 });
    stamp(ctx, 'INTERDIT', W / 2, BASE - 290, prog(t, hookBlock.lines[0].e - 0.55, 0.35) * (1 - out), 92);
    // grand titre (présent dès la 1re image pour la miniature)
    const [l1, l2] = ep.hook.title;
    const ty = lerp(330, 120, easeInOut(out)), ts = lerp(1, 0.45, easeInOut(out));
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(W / 2, ty); ctx.scale(ts, ts);
    strokeText(ctx, l1, 0, 0, fitSize(ctx, l1, 132, 960), { lw: 22 });
    strokeText(ctx, l2, 0, 140, fitSize(ctx, l2, 132, 960), { lw: 22, color: '#FFD43B' });
    ctx.restore();
  }

  // ---------- En-tête persistant + titre pays ----------
  if (active >= 0 && active < scenes.length) {
    const hp = easeOut(prog(t, trStart(0) + 0.1, 0.4));
    ctx.save(); ctx.globalAlpha = hp;
    // pastille noire « LES CADEAUX INTERDITS »
    const [h1, h2] = ep.header, hs = 30; ctx.font = font(hs);
    const w1 = ctx.measureText(h1).width, w2 = ctx.measureText(h2).width, pw = w1 + w2 + 56;
    rr(ctx, W / 2 - pw / 2, 64, pw, 52, 26); ctx.fillStyle = 'rgba(17,17,17,0.92)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = '#fff'; ctx.fillText(h1, W / 2 - pw / 2 + 28, 91);
    ctx.fillStyle = '#FFD43B'; ctx.fillText(h2, W / 2 - pw / 2 + 28 + w1, 91);
    ctx.restore();
    // titre du pays : drapeau + nom
    const s = scenes[active];
    const ap = easeOut(prog(t, T[active] - 0.35, 0.35));
    const name = s.country, size = fitSize(ctx, name, 92, 760);
    ctx.font = font(size); const nw = ctx.measureText(name).width, fw = 96, fh = 70, gap = 26;
    const total = fw + gap + nw, x0 = W / 2 - total / 2, y = 205 + (1 - ap) * -30;
    ctx.save(); ctx.globalAlpha = ap;
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    drawFlagRect(ctx, s.flagImg, x0, y - fh / 2, fw, fh); ctx.restore();
    ctx.save(); ctx.globalAlpha = ap; strokeText(ctx, name, x0 + fw + gap, y + 4, size, { align: 'left', lw: 16 }); ctx.restore();

    // objet + étiquettes
    const { stampT, tagT } = stampTimes(s.block.lines);
    const dropStart = T[active] + 0.35;
    const leave = active + 1 < scenes.length ? trStart(active + 1) : TOUT - TR_PRE;
    const out = prog(t, leave, 0.3);
    const alpha = 1 - out, drop = prog(t, dropStart, 0.75);
    if (drop > 0) {
      let info;
      if (s.multiply) {
        const pos = [[-150, -10], [150, -10], [-150, -270], [150, -270]];
        pos.forEach(([dx, dy], j) => {
          const d = prog(t, dropStart + j * 0.12, 0.7);
          if (d > 0) drawObject(ctx, s.obj, W / 2 + dx, BASE + dy, 280, 250, { drop: d, alpha, scale: 1 - out * 0.3 });
        });
        info = { top: BASE - 520 };
      } else info = drawObject(ctx, s.obj, W / 2, BASE, 660, 580, { drop, alpha, scale: 1 - out * 0.3 });
      // étiquette noire : nom de l'objet
      const lp = backOut(prog(t, dropStart + 0.35, 0.3));
      if (lp > 0) {
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(W / 2, BASE + 62); ctx.scale(lp, lp);
        pill(ctx, s.object, 0, 0, { size: 44 }); ctx.restore();
      }
      // pièce / objet secondaire
      if (s.extraImg) {
        const ep2 = backOut(prog(t, tagT + 0.15, 0.35));
        if (ep2 > 0) {
          ctx.save(); ctx.globalAlpha = alpha; ctx.translate(W / 2 + 300, BASE - 120); ctx.scale(ep2, ep2); ctx.rotate(0.15);
          ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
          const k = 230 / Math.max(s.extraImg.width, s.extraImg.height);
          ctx.drawImage(s.extraImg, -s.extraImg.width * k / 2, -s.extraImg.height * k / 2, s.extraImg.width * k, s.extraImg.height * k);
          ctx.restore();
        }
      }
      // tampon INTERDIT
      ctx.save(); ctx.globalAlpha = alpha; stamp(ctx, 'INTERDIT', W / 2, BASE - 260, prog(t, stampT, 0.35), 84); ctx.restore();
      // étiquette rouge : le fait
      const tp = backOut(prog(t, tagT, 0.3));
      if (tp > 0) {
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(W / 2, 395); ctx.scale(tp, tp);
        const sz = fitSize(ctx, s.tag, 44, 820);
        pill(ctx, s.tag, 0, 0, { size: sz, bg: '#E53935', radius: 10 }); ctx.restore();
      }
    }
  }

  // ---------- OUTRO ----------
  if (t >= TOUT - 0.4) {
    const p = easeOut(prog(t, TOUT - 0.2, 0.5));
    ctx.save(); ctx.globalAlpha = p; ctx.translate(W / 2, 250); ctx.scale(lerp(0.6, 1, backOut(prog(t, TOUT - 0.2, 0.45))), lerp(0.6, 1, backOut(prog(t, TOUT - 0.2, 0.45))));
    strokeText(ctx, ep.outro.title, 0, 0, fitSize(ctx, ep.outro.title, 128, 980), { lw: 22, color: '#FFD43B' });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = prog(t, TOUT + 0.2, 0.4);
    ctx.font = font(76, 'Caveat'); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.fillText(ep.outro.subtitle, W / 2, 370); ctx.restore();
    // grille des 8 cadeaux interdits
    scenes.forEach((s, j) => {
      const col = j % 4, row = Math.floor(j / 4);
      const cx = 165 + col * 250, by = 690 + row * 290;
      const d = prog(t, TOUT + 0.1 + j * 0.09, 0.6);
      if (d <= 0) return;
      const img = s.obj;
      drawObject(ctx, img, cx, by, 210, 190, { drop: d });
      const fl = backOut(prog(t, TOUT + 0.4 + j * 0.09, 0.3));
      if (fl > 0) { ctx.save(); ctx.translate(cx, by + 34); ctx.scale(fl, fl); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 8; drawFlagRect(ctx, s.flagImg, -30, -22, 60, 44); ctx.restore(); }
      // petite croix rouge
      const xp = prog(t, TOUT + 0.7 + j * 0.09, 0.2);
      if (xp > 0) {
        ctx.save(); ctx.globalAlpha = 0.9; ctx.lineCap = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = '#E8222E';
        ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6;
        const r = 60 * easeOut(xp), yy = by - 85;
        ctx.beginPath(); ctx.moveTo(cx - r, yy - r); ctx.lineTo(cx + r, yy + r); ctx.moveTo(cx + r, yy - r); ctx.lineTo(cx - r, yy + r); ctx.stroke(); ctx.restore();
      }
    });
    const l2 = outroBlock.lines[1];
    const c1 = backOut(prog(t, l2.s - 0.1, 0.3)), c2 = backOut(prog(t, l2.s + 0.9, 0.3));
    if (c1 > 0) { ctx.save(); ctx.translate(W / 2, 1290); ctx.scale(c1, c1); pill(ctx, 'DIS-LE EN COMMENTAIRE', 0, 0, { size: 46, bg: '#E6197C', radius: 14 }); ctx.restore(); }
    if (c2 > 0) {
      const pulse = 1 + 0.05 * Math.sin((t - l2.s) * 9);
      ctx.save(); ctx.translate(W / 2, 1385); ctx.scale(c2 * pulse, c2 * pulse);
      pill(ctx, 'ABONNE-TOI', 0, 0, { size: 50, bg: '#E8222E', border: false, radius: 18, padX: 60 }); ctx.restore();
    }
  }

  drawCaption(ctx, t);
}

// ---------- Sortie ----------
const preview = opt('--preview');
if (preview) {
  fs.mkdirSync(`${OUT}/preview`, { recursive: true });
  for (const ts of preview.split(',').map(Number)) {
    renderFrame(ts);
    fs.writeFileSync(`${OUT}/preview/f_${ts.toFixed(2)}.jpg`, canvas.toBuffer('image/jpeg', 85));
  }
  console.log('aperçus écrits');
} else {
  const from = +(opt('--from') || 0), to = +(opt('--to') || DUR);
  const n0 = Math.floor(from * FPS), n1 = Math.ceil(to * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', `${OUT}/video_silent.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let n = n0; n < n1; n++) {
    renderFrame(n / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (n % 150 === 0) console.log(`image ${n}/${n1} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('vidéo muette écrite', `${OUT}/video_silent.mp4`);
}
