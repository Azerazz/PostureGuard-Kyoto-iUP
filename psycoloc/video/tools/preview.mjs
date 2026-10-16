// Rend des images fixes de contrôle : node tools/preview.mjs <outDir> <slug> [filtres...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const browserExecutable = process.env.BROWSER;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const slug = process.argv[3];
const timeline = JSON.parse(fs.readFileSync(`src/timelines/${slug}.json`, 'utf8'));
const jobs = [];
for (const s of timeline.scenes) {
  const mid = Math.round(((s.start + s.end) / 2) * timeline.fps);
  jobs.push([slug.toUpperCase(), mid, `${String(jobs.length).padStart(2, '0')}_${s.id}`]);
}
const only = process.argv.slice(4);
for (const [id, frame, name] of jobs) {
  if (only.length && !only.some((o) => name.includes(o))) continue;
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  await renderStill({composition, serveUrl, frame, output: `${out}/${name}.png`, browserExecutable, scale: 0.4});
  console.log(name);
}
