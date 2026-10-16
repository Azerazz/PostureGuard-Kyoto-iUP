import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_SUB} from '../theme';

type Word = {t: string; s: number; e: number; k?: boolean};
type Scene = {id: string; start: number; end: number; words: Word[]};

// Style « TikTok pédago » : 1-2 mots à la fois, blanc à fin contour, mots-clés en jaune.
const MAX_WORDS = 2;
const MAX_CHARS = 14;
const YELLOW = '#FFD84A';
const STROKE = '#1B1B1B';

const buildChunks = (scenes: Scene[]) => {
  const chunks: {words: Word[]; start: number; end: number}[] = [];
  for (const sc of scenes) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) chunks.push({words: cur, start: cur[0].s, end: 0});
      cur = [];
    };
    for (const w of sc.words) {
      const len = cur.reduce((n, x) => n + x.t.length + 1, 0) + w.t.length;
      // on ne mélange pas mot-clé et mot normal dans un même bloc
      if (cur.length >= MAX_WORDS || (cur.length && (len > MAX_CHARS || !!cur[0].k !== !!w.k))) flush();
      cur.push(w);
      if (/[.,?!:…]$/.test(w.t)) flush();
    }
    flush();
  }
  chunks.forEach((c, i) => {
    const last = c.words[c.words.length - 1];
    c.end = i + 1 < chunks.length ? Math.min(chunks[i + 1].start, last.e + 0.5) : last.e + 0.5;
  });
  return chunks;
};

export const Subtitles: React.FC<{scenes: Scene[]; y?: number}> = ({scenes, y = 1275}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const chunks = useMemo(() => buildChunks(scenes), [scenes]);
  const chunk = chunks.find((c) => t >= c.start && t < c.end);
  if (!chunk) return null;
  const age = f - chunk.start * fps;
  const scale = age < 3 ? 0.92 + 0.08 * (age / 3) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: y,
        transform: `translateY(-50%) scale(${scale})`,
        textAlign: 'center',
        fontFamily: FONT_SUB,
        fontWeight: 900,
        fontSize: 92,
        lineHeight: 1.05,
        letterSpacing: -0.5,
        color: chunk.words[0].k ? YELLOW : '#fff',
        WebkitTextStroke: `9px ${STROKE}`,
        paintOrder: 'stroke fill',
        textShadow: `0 5px 0 ${STROKE}, 0 8px 14px rgba(0,0,0,0.35)`,
      }}
    >
      {chunk.words.map((w) => w.t).join(' ')}
    </div>
  );
};
