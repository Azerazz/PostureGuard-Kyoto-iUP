import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {OL} from '../theme';

/*
 * Personnages au style « cartoon pédago » : grosse tête ronde, grands yeux aux paupières
 * mi-closes, joues roses, articulations rondes aux épaules et aux coudes, baskets épaisses.
 */

export type Who = 'malik' | 'jade' | 'ines' | 'theo' | 'prof' | 'author' | 'friend' | 'studentA' | 'studentB';
export type Expr = 'happy' | 'smile' | 'wow' | 'sad' | 'wink' | 'love' | 'smug' | 'annoyed' | 'nervous';
export type Arm = 'down' | 'wave' | 'up' | 'hip' | 'hold' | 'point' | 'cross' | 'chin';

type HairStyle = 'cap' | 'bun' | 'curly' | 'messy' | 'prof' | 'long' | 'short' | 'ponytail';
type Spec = {
  skin: string;
  hair: string;
  style: HairStyle;
  top: string;
  pants: string;
  sole: string;
  accent?: string;
  hoodie?: boolean;
  coat?: boolean;
  glasses?: boolean;
  earrings?: boolean;
};

export const SPECS: Record<Who, Spec> = {
  malik: {skin: '#A86F4C', hair: '#24170F', style: 'cap', top: '#3FB394', pants: '#2E3A4F', sole: '#E8505B', accent: '#F6C445', hoodie: true},
  jade: {skin: '#F2C8A2', hair: '#2A1E24', style: 'bun', top: '#F0646A', pants: '#2E3E66', sole: '#F6C445', earrings: true},
  ines: {skin: '#8A5638', hair: '#2B1910', style: 'curly', top: '#F6C445', pants: '#5B4B8A', sole: '#3FB394', accent: '#F28FB0', hoodie: true},
  theo: {skin: '#F3CFAE', hair: '#7A4E2C', style: 'messy', top: '#4E7FE0', pants: '#3A3A4A', sole: '#E8505B'},
  prof: {skin: '#F0C8A4', hair: '#B6B9C2', style: 'prof', top: '#8FC9A8', pants: '#3E3E4C', sole: '#3E3E4C', coat: true, glasses: true},
  author: {skin: '#F4D0AE', hair: '#A34E2A', style: 'long', top: '#3FAFA7', pants: '#2E3E66', sole: '#F28FB0', glasses: true},
  friend: {skin: '#D9A27C', hair: '#C99A3F', style: 'short', top: '#8C7BEA', pants: '#2E3A4F', sole: '#F6C445'},
  studentA: {skin: '#B97F59', hair: '#1D1717', style: 'short', top: '#8FD6BE', pants: '#2E3A4F', sole: '#4E7FE0'},
  studentB: {skin: '#F2C8A2', hair: '#5E3520', style: 'ponytail', top: '#C49BF2', pants: '#2E3E66', sole: '#F0646A'},
};

const SW = 5;
const SH: Record<'L' | 'R', [number, number]> = {L: [84, 272], R: [216, 272]};
const L1 = 64;
const L2 = 58;

const pose = (p: Arm, f: number, k: number): [number, number] => {
  switch (p) {
    case 'wave':
      return [118, 170 + 22 * Math.sin(f / 3.2 + k)];
    case 'up':
      return [160 + 5 * Math.sin(f / 5 + k), 172];
    case 'hip':
      return [42, -48];
    case 'hold':
      return [12, -72];
    case 'point':
      return [84 + 3 * Math.sin(f / 6), 90];
    case 'cross':
      return [14, -100];
    case 'chin':
      return [18, -158];
    default:
      return [9 + 2 * Math.sin(f / 11 + k), 4];
  }
};

const ArmShape: React.FC<{side: 'L' | 'R'; p: Arm; color: string; skin: string; f: number}> = ({side, p, color, skin, f}) => {
  const [sx, sy] = SH[side];
  const d = side === 'L' ? -1 : 1;
  const [a1, a2] = pose(p, f, side === 'L' ? 0 : 2).map((x) => (x * Math.PI) / 180);
  const ex = sx + d * Math.sin(a1) * L1;
  const ey = sy + Math.cos(a1) * L1;
  const hx = ex + d * Math.sin(a2) * L2;
  const hy = ey + Math.cos(a2) * L2;
  return (
    <g>
      <polyline points={`${sx},${sy} ${ex},${ey} ${hx},${hy}`} fill="none" stroke={OL} strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${sx},${sy} ${ex},${ey} ${hx},${hy}`} fill="none" stroke={color} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={ex} cy={ey} r={19} fill={color} stroke={OL} strokeWidth={SW} />
      <circle cx={hx} cy={hy} r={18} fill={skin} stroke={OL} strokeWidth={SW} />
    </g>
  );
};

const HairBack: React.FC<{s: Spec}> = ({s}) => {
  const st = {fill: s.hair, stroke: OL, strokeWidth: SW, strokeLinejoin: 'round' as const};
  switch (s.style) {
    case 'bun':
      return (
        <g {...st}>
          <circle cx={150} cy={30} r={40} />
          <path d="M34,160 Q34,26 150,26 Q266,26 266,160 L272,300 Q150,322 28,300Z" />
        </g>
      );
    case 'long':
      return <path {...st} d="M34,170 Q28,30 150,28 Q272,30 266,170 Q276,260 284,330 Q246,350 214,326 L86,326 Q54,350 16,330 Q24,260 34,170Z" />;
    case 'ponytail':
      return <path {...st} d="M236,80 Q330,96 312,250 Q292,222 262,214 Z" />;
    case 'curly': {
      const c: [number, number, number][] = [];
      for (let i = 0; i < 15; i++) {
        const t = Math.PI * 0.78 + (i / 14) * Math.PI * 1.44;
        c.push([150 + Math.cos(t) * 120, 142 + Math.sin(t) * 116, 46]);
      }
      c.push([40, 250, 40], [260, 250, 40]);
      return (
        <g>
          <g fill="none" stroke={OL} strokeWidth={SW * 2}>
            {c.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
          </g>
          <g fill={s.hair}>{c.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
        </g>
      );
    }
    default:
      return null;
  }
};

const HairFront: React.FC<{s: Spec}> = ({s}) => {
  const st = {fill: s.hair, stroke: OL, strokeWidth: SW, strokeLinejoin: 'round' as const};
  switch (s.style) {
    case 'cap':
      return (
        <g>
          <rect x={40} y={112} width={18} height={52} rx={7} fill={s.hair} />
          <rect x={242} y={112} width={18} height={52} rx={7} fill={s.hair} />
          <path d="M40,124 A112,112 0 0 1 260,124 Z" fill={s.top} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M238,110 Q314,92 340,126 Q302,140 248,130 Z" fill={s.top} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M150,40 L150,124 M86,70 Q104,96 104,124 M214,70 Q196,96 196,124" stroke={OL} strokeWidth={3} opacity={0.3} fill="none" />
          <circle cx={150} cy={38} r={9} fill={s.accent} stroke={OL} strokeWidth={4} />
        </g>
      );
    case 'bun':
      return <path {...st} d="M40,152 Q44,40 150,38 Q256,40 260,152 Q234,92 178,84 Q160,116 126,90 Q78,100 40,152Z" />;
    case 'long':
      return <path {...st} d="M38,166 Q38,40 150,38 Q262,40 262,166 Q246,96 150,88 Q66,94 38,166Z" />;
    case 'curly':
      return (
        <g>
          {[[96, 62], [136, 46], [178, 48], [216, 70], [62, 100], [240, 104]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={32} {...st} />
          ))}
          <path d="M56,116 Q150,46 244,116" fill="none" stroke={OL} strokeWidth={20} strokeLinecap="round" />
          <path d="M56,116 Q150,46 244,116" fill="none" stroke={s.accent} strokeWidth={11} strokeLinecap="round" />
        </g>
      );
    case 'messy':
      return <path {...st} d="M40,132 L50,52 L82,76 L96,18 L130,58 L154,6 L180,52 L212,18 L220,70 L254,50 L260,132 Q220,80 150,82 Q82,82 40,132Z" />;
    case 'short':
    case 'ponytail':
      return <path {...st} d="M40,136 Q36,36 150,32 Q264,36 260,136 Q248,86 196,76 Q172,96 140,78 Q86,82 40,136Z" />;
    case 'prof':
      return (
        <g {...st}>
          <path d="M40,178 Q32,122 60,104 Q72,140 62,186Z" />
          <path d="M260,178 Q268,122 240,104 Q228,140 238,186Z" />
          <path d="M122,42 Q136,22 148,40 Q160,22 176,44" fill="none" />
        </g>
      );
  }
};

const Eye: React.FC<{cx: number; cy: number; expr: Expr; blink: boolean; skin: string; right: boolean; look: number}> = ({cx, cy, expr, blink, skin, right, look}) => {
  if (expr === 'love') {
    return <path transform={`translate(${cx},${cy}) scale(1.45)`} d="M0,14 C-26,-4 -14,-22 0,-10 C14,-22 26,-4 0,14Z" fill="#F0506E" stroke={OL} strokeWidth={3.5} />;
  }
  if ((expr === 'wink' && right) || blink) {
    return <path d={`M${cx - 24},${cy + 2} Q${cx},${cy + 16} ${cx + 24},${cy + 2}`} fill="none" stroke={OL} strokeWidth={6} strokeLinecap="round" />;
  }
  // hauteur de la paupière supérieure (plus c'est grand, plus l'œil est fermé)
  const lid: Partial<Record<Expr, number>> = {smile: 0.32, smug: 0.5, annoyed: 0.58, sad: 0.3, wink: 0.3};
  const l = lid[expr];
  const r = 31;
  const pr = expr === 'wow' ? 10 : 14;
  const ly = cy - r + (l ?? 0) * 2 * r;
  const half = Math.sqrt(Math.max(r * r - (ly - cy) ** 2, 0));
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" />
      <circle cx={cx + look} cy={cy + 4} r={pr} fill="#2A1A14" />
      <circle cx={cx + look + 5} cy={cy - 1} r={5} fill="#fff" />
      {l !== undefined && (
        <g>
          {/* paupière = segment de cercle couleur peau au-dessus de la ligne ly */}
          <path d={`M${cx - half},${ly} A${r},${r} 0 ${ly > cy ? 1 : 0} 1 ${cx + half},${ly} Z`} fill={skin} />
          <path d={`M${cx - half},${ly} L${cx + half},${ly}`} stroke={OL} strokeWidth={SW + 1} strokeLinecap="round" />
        </g>
      )}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={OL} strokeWidth={SW} />
    </g>
  );
};

const Mouth: React.FC<{expr: Expr; talk: number | null}> = ({expr, talk}) => {
  const st = {fill: 'none', stroke: OL, strokeWidth: 6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  if (talk !== null) {
    const o = 6 + 22 * talk;
    return (
      <g>
        <path d={`M124,214 Q150,${214 + o * 1.6} 176,214 Z`} fill="#5A1E2A" stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M130,216 L170,216" stroke="#fff" strokeWidth={5} />
      </g>
    );
  }
  switch (expr) {
    case 'happy':
    case 'love':
    case 'wink':
      return (
        <g>
          <path d="M116,208 Q150,262 184,208 Z" fill="#5A1E2A" stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M122,211 L178,211 L172,222 L128,222 Z" fill="#fff" />
          <ellipse cx={150} cy={240} rx={15} ry={7} fill="#F07A8A" />
        </g>
      );
    case 'wow':
      return <ellipse cx={150} cy={228} rx={14} ry={19} fill="#5A1E2A" stroke={OL} strokeWidth={SW} />;
    case 'sad':
      return <path d="M130,234 Q150,216 170,234" {...st} />;
    case 'smug':
      return <path d="M128,222 Q156,236 178,212" {...st} />;
    case 'annoyed':
      return <path d="M132,228 L170,226" {...st} />;
    case 'nervous':
      return <path d="M120,226 q7.5,-8 15,0 t15,0 t15,0 t15,0" {...st} />;
    default:
      return <path d="M126,214 Q150,238 174,214" {...st} />;
  }
};

const Brows: React.FC<{expr: Expr; color: string}> = ({expr, color}) => {
  const st = {stroke: color === '#B6B9C2' ? '#8E929C' : OL, strokeWidth: 6, strokeLinecap: 'round' as const, fill: 'none'};
  const off: Partial<Record<Expr, [number, number]>> = {sad: [8, -6], annoyed: [-8, 8], wow: [-10, -10], nervous: [6, -4], smug: [0, -10]};
  const [a, b] = off[expr] ?? [0, 0];
  return (
    <g>
      <path d={`M86,${120 - a * 0.2} Q106,${110 + Math.min(a, 0)} 126,${118 + a}`} {...st} transform={`translate(0,${expr === 'wow' ? -8 : 0})`} />
      <path d={`M174,${118 + a} Q194,${110 + Math.min(b, 0)} 214,${120 + b * 0.2}`} {...st} transform={`translate(0,${expr === 'wow' || expr === 'smug' ? -8 : 0})`} />
    </g>
  );
};

export const Character: React.FC<{
  who: Who;
  x: number;
  y: number;
  h: number;
  expr?: Expr;
  arms?: [Arm, Arm];
  flip?: boolean;
  talking?: boolean;
  delay?: number;
  look?: number;
  extra?: React.ReactNode;
}> = ({who, x, y, h, expr = 'smile', arms = ['down', 'down'], flip = false, talking = false, delay = 0, look = 0, extra}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = SPECS[who];
  const seed = who.length * 7;
  // entrée : surgit du bas en rebondissant (comme dans les vidéos de référence)
  const pop = spring({frame: f - delay, fps, config: {damping: 10, stiffness: 160}});
  const rise = (1 - pop) * h * 0.35;
  const bob = Math.sin((f + seed) / 7) * h * 0.007;
  const squash = 1 + Math.sin((f + seed) / 7) * 0.01;
  const blink = (f + seed * 3) % 100 < 4;
  const talk = talking ? Math.abs(Math.sin(f * 0.9)) * (0.6 + 0.4 * Math.sin(f * 0.33)) : null;
  const w = (h * 420) / 560;
  const coatColor = '#FFFFFF';
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h + bob + rise,
        width: w,
        height: h,
        opacity: Math.min(1, pop * 3),
        transform: `scaleX(${flip ? -1 : 1}) scaleY(${squash * (0.85 + 0.15 * pop)})`,
        transformOrigin: '50% 100%',
      }}
    >
      <svg viewBox="-60 -50 420 560" width="100%" height="100%" style={{overflow: 'visible'}}>
        <HairBack s={s} />
        {/* jambes */}
        <g stroke={OL} strokeWidth={SW}>
          <rect x={101} y={386} width={38} height={80} rx={8} fill={s.pants} />
          <rect x={161} y={386} width={38} height={80} rx={8} fill={s.pants} />
        </g>
        {/* baskets épaisses */}
        {[120, 180].map((cx, i) => (
          <g key={i}>
            <path d={`M${cx - 38},486 L${cx - 38},472 Q${cx - 38},452 ${cx - 14},452 L${cx + 14},452 Q${cx + 38},452 ${cx + 38},472 L${cx + 38},486 Z`} fill="#fff" stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
            <rect x={cx - 38} y={482} width={76} height={12} rx={6} fill={s.sole} stroke={OL} strokeWidth={SW} />
          </g>
        ))}
        {/* buste */}
        {s.hoodie && <ellipse cx={150} cy={254} rx={72} ry={24} fill={s.top} stroke={OL} strokeWidth={SW} />}
        <path d="M90,248 L210,248 Q226,248 228,264 L236,392 Q236,400 228,400 L72,400 Q64,400 64,392 L72,264 Q74,248 90,248Z" fill={s.top} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
        {s.hoodie && (
          <g>
            <path d="M106,336 L194,336 L200,384 L100,384 Z" fill="none" stroke={OL} strokeWidth={4} opacity={0.35} strokeLinejoin="round" />
            <path d="M134,262 L130,306 M166,262 L170,306" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {s.coat && (
          <g stroke={OL} strokeWidth={SW} strokeLinejoin="round">
            <path d="M90,248 L128,248 L150,318 L172,248 L210,248 Q226,248 228,264 L240,438 L60,438 L72,264 Q74,248 90,248Z" fill={coatColor} />
            <path d="M128,248 L150,318 L172,248 Z" fill={s.top} />
            <rect x={176} y={350} width={34} height={30} rx={5} fill="#fff" strokeWidth={4} />
            <path d="M196,346 L196,366" stroke="#4E7FE0" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {/* épaules bouffantes */}
        <circle cx={SH.L[0]} cy={SH.L[1]} r={26} fill={s.coat ? coatColor : s.top} stroke={OL} strokeWidth={SW} />
        <circle cx={SH.R[0]} cy={SH.R[1]} r={26} fill={s.coat ? coatColor : s.top} stroke={OL} strokeWidth={SW} />
        <ArmShape side="L" p={arms[0]} color={s.coat ? coatColor : s.top} skin={s.skin} f={f} />
        <ArmShape side="R" p={arms[1]} color={s.coat ? coatColor : s.top} skin={s.skin} f={f} />
        {/* tête */}
        <circle cx={40} cy={164} r={20} fill={s.skin} stroke={OL} strokeWidth={SW} />
        <circle cx={260} cy={164} r={20} fill={s.skin} stroke={OL} strokeWidth={SW} />
        {s.earrings && (
          <g fill="none" stroke="#E9B53B" strokeWidth={6}>
            <circle cx={40} cy={198} r={13} />
            <circle cx={260} cy={198} r={13} />
          </g>
        )}
        <circle cx={150} cy={150} r={112} fill={s.skin} stroke={OL} strokeWidth={SW} />
        <circle cx={76} cy={202} r={17} fill="#F38C9E" opacity={0.6} />
        <circle cx={224} cy={202} r={17} fill="#F38C9E" opacity={0.6} />
        <Eye cx={108} cy={164} expr={expr} blink={blink && expr !== 'love'} skin={s.skin} right={false} look={look} />
        <Eye cx={192} cy={164} expr={expr} blink={blink && expr !== 'love'} skin={s.skin} right look={look} />
        {s.glasses && (
          <g fill="none" stroke={OL} strokeWidth={6}>
            <circle cx={108} cy={164} r={40} />
            <circle cx={192} cy={164} r={40} />
            <path d="M146,158 Q150,152 154,158" />
          </g>
        )}
        <Brows expr={expr} color={s.hair} />
        <Mouth expr={expr} talk={talk} />
        <HairFront s={s} />
        {expr === 'sad' && (
          <g fill="#8FD0FF" stroke={OL} strokeWidth={3}>
            <path d={`M96,${196 + ((f * 3) % 70)} q-9,16 0,20 q9,-4 0,-20Z`} />
            <path d={`M204,${196 + ((f * 3 + 35) % 70)} q-9,16 0,20 q9,-4 0,-20Z`} />
          </g>
        )}
        {expr === 'nervous' && <path d={`M262,${78 + (f % 40) / 2} q-14,26 0,30 q14,-4 0,-30Z`} fill="#8FD0FF" stroke={OL} strokeWidth={4} />}
        {extra}
      </svg>
    </div>
  );
};
