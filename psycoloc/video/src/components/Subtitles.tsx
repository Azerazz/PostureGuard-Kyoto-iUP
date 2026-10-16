import React, {useMemo} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_SUB, OL} from '../theme';

type Word = {t: string; s: number; e: number};
type Scene = {id: string; start: number; end: number; words: Word[]};

const MAX_WORDS = 3;
const MAX_CHARS = 18;

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
      if (cur.length >= MAX_WORDS || (cur.length && len > MAX_CHARS)) flush();
      cur.push(w);
      if (/[.,?!:…]$/.test(w.t)) flush();
    }
    flush();
  }
  chunks.forEach((c, i) => {
    const last = c.words[c.words.length - 1];
    c.end = i + 1 < chunks.length ? Math.min(chunks[i + 1].start, last.e + 0.6) : last.e + 0.6;
  });
  return chunks;
};

export const Subtitles: React.FC<{scenes: Scene[]; y?: number}> = ({scenes, y = 1410}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const chunks = useMemo(() => buildChunks(scenes), [scenes]);
  const chunk = chunks.find((c) => t >= c.start && t < c.end);
  if (!chunk) return null;
  const pop = spring({frame: f - Math.round(chunk.start * fps), fps, config: {damping: 10, stiffness: 220}});
  return (
    <div
      style={{
        position: 'absolute',
        left: 50,
        right: 50,
        top: y,
        transform: `translateY(-50%) scale(${0.7 + 0.3 * pop})`,
        textAlign: 'center',
        fontFamily: FONT_SUB,
        fontWeight: 900,
        fontSize: 96,
        lineHeight: 1.1,
        letterSpacing: -1,
      }}
    >
      {chunk.words.map((w, i) => {
        const active = t >= w.s && (i === chunk.words.length - 1 || t < chunk.words[i + 1].s);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              margin: '0 20px',
              color: active ? C.yellow : '#fff',
              WebkitTextStroke: `18px ${OL}`,
              paintOrder: 'stroke fill',
              textShadow: `0 8px 0 ${OL}`,
              transform: active ? 'scale(1.08)' : undefined,
            }}
          >
            {w.t}
          </span>
        );
      })}
    </div>
  );
};
