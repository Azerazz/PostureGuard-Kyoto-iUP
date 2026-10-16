import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {OL} from '../theme';

export type Who = 'malik' | 'jade' | 'ines' | 'theo' | 'prof' | 'author' | 'friend' | 'studentA' | 'studentB';
export type Expr = 'happy' | 'smile' | 'wow' | 'sad' | 'wink' | 'love' | 'smug' | 'annoyed' | 'nervous';
export type Arm = 'down' | 'wave' | 'up' | 'hip' | 'hold' | 'point' | 'cross';

type HairStyle = 'cap' | 'bun' | 'curly' | 'messy' | 'prof' | 'long' | 'short' | 'ponytail';
type Spec = {
  skin: string;
  hair: string;
  style: HairStyle;
  top: string;
  pants: string;
  shoe: string;
  accent?: string;
  hoodie?: boolean;
  coat?: boolean;
  glasses?: boolean;
};

export const SPECS: Record<Who, Spec> = {
  malik: {skin: '#B97A56', hair: '#2B1B14', style: 'cap', top: '#4CC38A', pants: '#3D4A6B', shoe: '#FFFFFF', accent: '#FF5E7E', hoodie: true},
  jade: {skin: '#F3CDA5', hair: '#2E2230', style: 'bun', top: '#FF6B6B', pants: '#2F3E66', shoe: '#FFFFFF', accent: '#FFD23F'},
  ines: {skin: '#8D5A3B', hair: '#3A2216', style: 'curly', top: '#FFD23F', pants: '#5B4B8A', shoe: '#FFFFFF', accent: '#FF9EC0', hoodie: true},
  theo: {skin: '#F6D3B3', hair: '#8A5A33', style: 'messy', top: '#6FA8FF', pants: '#3A3A4A', shoe: '#FFFFFF', accent: '#FFD23F'},
  prof: {skin: '#F1C9A5', hair: '#B9BCC6', style: 'prof', top: '#8FB8FF', pants: '#4A4A5A', shoe: '#3A3A4A', coat: true, glasses: true},
  author: {skin: '#F5D1B0', hair: '#B5562E', style: 'long', top: '#3FB8AF', pants: '#2F3E66', shoe: '#FFFFFF', glasses: true},
  friend: {skin: '#E8B48E', hair: '#D9A441', style: 'short', top: '#8E7CFF', pants: '#3D4A6B', shoe: '#FFFFFF'},
  studentA: {skin: '#C68B63', hair: '#1E1A1A', style: 'short', top: '#8FE3C4', pants: '#3D4A6B', shoe: '#FFFFFF'},
  studentB: {skin: '#F3CDA5', hair: '#6B3E26', style: 'ponytail', top: '#C59BFF', pants: '#2F3E66', shoe: '#FFFFFF'},
};

const SW = 6; // épaisseur de contour
const SHOULDER: Record<'L' | 'R', [number, number]> = {L: [100, 328], R: [200, 328]};

const armAngle = (pose: Arm, f: number, side: number): [number, number] => {
  switch (pose) {
    case 'wave':
      return [148 + 18 * Math.sin(f / 3.5 + side), 118];
    case 'up':
      return [166 + 6 * Math.sin(f / 5 + side), 118];
    case 'hip':
      return [38, 112];
    case 'hold':
      return [-32, 102];
    case 'point':
      return [96 + 4 * Math.sin(f / 6), 125];
    case 'cross':
      return [-55, 88];
    default:
      return [12 + 2 * Math.sin(f / 10 + side), 118];
  }
};

const ArmShape: React.FC<{side: 'L' | 'R'; pose: Arm; color: string; skin: string; f: number}> = ({side, pose, color, skin, f}) => {
  const [sx, sy] = SHOULDER[side];
  const dir = side === 'L' ? -1 : 1;
  const [deg, len] = armAngle(pose, f, side === 'L' ? 0 : 2);
  const a = (deg * Math.PI) / 180;
  const hx = sx + dir * Math.sin(a) * len;
  const hy = sy + Math.cos(a) * len;
  return (
    <g>
      <line x1={sx} y1={sy} x2={hx} y2={hy} stroke={OL} strokeWidth={36} strokeLinecap="round" />
      <line x1={sx} y1={sy} x2={hx} y2={hy} stroke={color} strokeWidth={24} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={17} fill={skin} stroke={OL} strokeWidth={5} />
    </g>
  );
};

const HairBack: React.FC<{s: Spec}> = ({s}) => {
  if (s.style === 'bun' || s.style === 'long') {
    return (
      <g fill={s.hair} stroke={OL} strokeWidth={SW} strokeLinejoin="round">
        {s.style === 'bun' && <circle cx={150} cy={66} r={42} />}
        <path d={s.style === 'long'
          ? 'M46,190 Q40,78 150,76 Q260,78 254,190 Q262,300 270,365 Q232,388 200,360 L100,360 Q68,388 30,365 Q38,300 46,190Z'
          : 'M48,185 Q48,80 150,80 Q252,80 252,185 L258,342 Q150,366 42,342 Z'} />
      </g>
    );
  }
  if (s.style === 'ponytail') {
    return <path d="M230,120 Q320,140 300,280 Q285,250 255,240 Z" fill={s.hair} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />;
  }
  if (s.style === 'curly') {
    const curls = [];
    for (let i = 0; i < 16; i++) {
      const t = Math.PI * 0.85 + (i / 15) * Math.PI * 1.3;
      curls.push(<circle key={i} cx={150 + Math.cos(t) * 108} cy={180 + Math.sin(t) * 104} r={44} />);
    }
    curls.push(<circle key="l1" cx={58} cy={290} r={40} />, <circle key="r1" cx={242} cy={290} r={40} />);
    return (
      <g>
        <g fill="none" stroke={OL} strokeWidth={SW * 2}>{curls}</g>
        <g fill={s.hair}>{curls}</g>
      </g>
    );
  }
  return null;
};

const HairFront: React.FC<{s: Spec}> = ({s}) => {
  const common = {fill: s.hair, stroke: OL, strokeWidth: SW, strokeLinejoin: 'round' as const};
  switch (s.style) {
    case 'cap':
      return (
        <g>
          <rect x={56} y={168} width={18} height={40} rx={6} fill={s.hair} />
          <rect x={226} y={168} width={18} height={40} rx={6} fill={s.hair} />
          <path d="M50,176 A100,100 0 0 1 250,176 Z" fill={s.top} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M228,160 Q300,140 330,172 Q290,190 236,182 Z" fill={s.top} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M60,150 A92,60 0 0 1 240,150" fill="none" stroke={OL} strokeWidth={4} opacity={0.35} />
          <circle cx={150} cy={78} r={9} fill={s.accent} stroke={OL} strokeWidth={4} />
        </g>
      );
    case 'bun':
      return <path d="M54,190 Q56,92 150,90 Q244,92 246,190 Q222,138 168,126 Q156,158 122,136 Q84,150 54,190Z" {...common} />;
    case 'long':
      return <path d="M52,196 Q52,90 150,88 Q248,90 248,196 Q230,130 150,122 Q86,126 52,196Z" {...common} />;
    case 'curly':
      return (
        <g>
          {[[96, 104], [136, 88], [178, 90], [214, 112], [70, 140], [232, 146]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={30} {...common} />
          ))}
          <path d="M70,150 Q150,96 232,150" fill="none" stroke={s.accent} strokeWidth={14} strokeLinecap="round" />
        </g>
      );
    case 'messy':
      return <path d="M52,180 L64,104 L92,124 L104,70 L136,104 L158,56 L184,98 L214,66 L222,116 L250,98 L248,182 Q214,128 150,130 Q90,130 52,180Z" {...common} />;
    case 'short':
    case 'ponytail':
      return <path d="M52,182 Q50,90 150,86 Q250,90 248,182 Q236,134 190,124 Q170,142 140,126 Q90,128 52,182Z" {...common} />;
    case 'prof':
      return (
        <g {...common}>
          <path d="M50,200 Q46,150 70,140 Q80,170 72,210 Z" />
          <path d="M250,200 Q254,150 230,140 Q220,170 228,210 Z" />
          <path d="M120,92 Q140,70 150,92 Q162,70 178,94" fill="none" />
        </g>
      );
  }
};

const Eye: React.FC<{cx: number; cy: number; expr: Expr; blink: boolean; skin: string; right: boolean; look: number}> = ({cx, cy, expr, blink, skin, right, look}) => {
  if (expr === 'love') {
    return (
      <path
        transform={`translate(${cx},${cy}) scale(1.4)`}
        d="M0,14 C-26,-4 -14,-22 0,-10 C14,-22 26,-4 0,14Z"
        fill="#FF3B6B"
        stroke={OL}
        strokeWidth={3.5}
      />
    );
  }
  if ((expr === 'wink' && right) || expr === 'happy' && blink) {
    return <path d={`M${cx - 22},${cy + 4} Q${cx},${cy - 18} ${cx + 22},${cy + 4}`} fill="none" stroke={OL} strokeWidth={7} strokeLinecap="round" />;
  }
  if (blink) {
    return <path d={`M${cx - 22},${cy} L${cx + 22},${cy}`} stroke={OL} strokeWidth={7} strokeLinecap="round" />;
  }
  const pr = expr === 'wow' ? 8 : 12;
  const lid = expr === 'smug' || expr === 'annoyed';
  return (
    <g>
      <circle cx={cx} cy={cy} r={27} fill="#fff" stroke={OL} strokeWidth={5} />
      <circle cx={cx + look} cy={cy + 4} r={pr} fill={OL} />
      <circle cx={cx + look + 4} cy={cy} r={4} fill="#fff" />
      {lid && (
        <g>
          <path d={`M${cx - 29},${cy + 1} A29,29 0 0 1 ${cx + 29},${cy + 1} Z`} fill={skin} />
          <path d={`M${cx - 27},${cy + 1} L${cx + 27},${cy + 1}`} stroke={OL} strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

const Mouth: React.FC<{expr: Expr; talk: number | null}> = ({expr, talk}) => {
  const st = {fill: 'none', stroke: OL, strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  if (talk !== null) {
    return <ellipse cx={150} cy={252} rx={18} ry={5 + 15 * talk} fill="#7A2A3A" stroke={OL} strokeWidth={5} />;
  }
  switch (expr) {
    case 'happy':
    case 'love':
      return (
        <g>
          <path d="M116,238 Q150,290 184,238 Q150,250 116,238Z" fill="#7A2A3A" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <path d="M134,262 Q150,256 166,262 Q150,274 134,262Z" fill="#FF7A9A" />
        </g>
      );
    case 'wow':
      return <ellipse cx={150} cy={256} rx={15} ry={21} fill="#7A2A3A" stroke={OL} strokeWidth={5} />;
    case 'sad':
      return <path d="M124,264 Q150,240 176,264" {...st} />;
    case 'smug':
      return <path d="M128,250 Q158,264 180,238" {...st} />;
    case 'annoyed':
      return <path d="M128,256 L172,252" {...st} />;
    case 'nervous':
      return <path d="M118,256 q8,-9 16,0 t16,0 t16,0 t16,0" {...st} />;
    default:
      return <path d="M124,244 Q150,268 176,244" {...st} />;
  }
};

const Brows: React.FC<{expr: Expr}> = ({expr}) => {
  const st = {stroke: OL, strokeWidth: 8, strokeLinecap: 'round' as const};
  const d: Record<string, [number, number, number, number]> = {
    sad: [-4, 10, 10, -4],
    annoyed: [12, -6, -6, 12],
    wow: [-8, -8, -8, -8],
    smug: [6, 0, -10, -10],
    nervous: [-2, 8, 8, -2],
  };
  const [a, b, c, e] = d[expr] ?? [2, -2, -2, 2];
  return (
    <g>
      <line x1={94} y1={152 + a} x2={130} y2={152 + b} {...st} />
      <line x1={170} y1={152 + c} x2={206} y2={152 + e} {...st} />
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
  const pop = spring({frame: f - delay, fps, config: {damping: 11, stiffness: 140}});
  const bob = Math.sin((f + seed) / 8) * h * 0.006;
  const squash = 1 + Math.sin((f + seed) / 8) * 0.008;
  const blink = (f + seed * 3) % 95 < 4;
  const talk = talking ? Math.abs(Math.sin(f * 0.85)) * (0.6 + 0.4 * Math.sin(f * 0.31)) : null;
  const w = (h * 420) / 640;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h + bob,
        width: w,
        height: h,
        transform: `scale(${pop}) scaleX(${flip ? -1 : 1}) scaleY(${squash})`,
        transformOrigin: '50% 100%',
      }}
    >
      <svg viewBox="-60 -30 420 640" width="100%" height="100%" style={{overflow: 'visible'}}>
        <HairBack s={s} />
        {/* jambes + chaussures */}
        <g stroke={OL} strokeWidth={SW} strokeLinejoin="round">
          <rect x={104} y={450} width={42} height={130} rx={14} fill={s.pants} />
          <rect x={154} y={450} width={42} height={130} rx={14} fill={s.pants} />
          <ellipse cx={120} cy={588} rx={36} ry={18} fill={s.shoe} />
          <ellipse cx={180} cy={588} rx={36} ry={18} fill={s.shoe} />
        </g>
        <path d="M100,592 L140,592 M160,592 L200,592" stroke={s.accent ?? '#FF5E7E'} strokeWidth={5} strokeLinecap="round" />
        {/* buste */}
        {s.hoodie && <ellipse cx={150} cy={302} rx={74} ry={26} fill={s.top} stroke={OL} strokeWidth={SW} />}
        <rect x={134} y={262} width={32} height={48} fill={s.skin} stroke={OL} strokeWidth={SW} />
        <path d="M94,334 Q94,300 126,300 L174,300 Q206,300 206,334 L206,468 L94,468 Z" fill={s.top} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
        {s.hoodie && (
          <g>
            <path d="M118,410 L182,410 L190,452 L110,452 Z" fill="none" stroke={OL} strokeWidth={4} opacity={0.5} />
            <path d="M136,308 L132,360 M164,308 L168,360" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {s.coat && (
          <g stroke={OL} strokeWidth={SW} strokeLinejoin="round">
            <path d="M94,334 Q94,300 126,300 L140,300 L150,380 L160,300 L174,300 Q206,300 206,334 L212,500 L88,500 Z" fill="#FFFFFF" />
            <path d="M150,312 L142,330 L150,400 L158,330 Z" fill="#FF5E7E" strokeWidth={4} />
            <rect x={170} y={410} width={26} height={22} rx={4} fill="#fff" strokeWidth={4} />
          </g>
        )}
        <ArmShape side="L" pose={arms[0]} color={s.coat ? '#FFFFFF' : s.top} skin={s.skin} f={f} />
        <ArmShape side="R" pose={arms[1]} color={s.coat ? '#FFFFFF' : s.top} skin={s.skin} f={f} />
        {/* tête */}
        <circle cx={56} cy={198} r={20} fill={s.skin} stroke={OL} strokeWidth={SW} />
        <circle cx={244} cy={198} r={20} fill={s.skin} stroke={OL} strokeWidth={SW} />
        <circle cx={150} cy={186} r={97} fill={s.skin} stroke={OL} strokeWidth={SW} />
        <ellipse cx={90} cy={232} rx={18} ry={10} fill="#FF7A9A" opacity={0.45} />
        <ellipse cx={210} cy={232} rx={18} ry={10} fill="#FF7A9A" opacity={0.45} />
        <Eye cx={113} cy={196} expr={expr} blink={blink} skin={s.skin} right={false} look={look} />
        <Eye cx={187} cy={196} expr={expr} blink={blink} skin={s.skin} right look={look} />
        {s.glasses && (
          <g fill="none" stroke={OL} strokeWidth={6}>
            <circle cx={113} cy={196} r={34} />
            <circle cx={187} cy={196} r={34} />
            <path d="M147,192 Q150,186 153,192" />
          </g>
        )}
        <Brows expr={expr} />
        <Mouth expr={expr} talk={talk} />
        <HairFront s={s} />
        {expr === 'sad' && (
          <g fill="#7CC6FF" stroke={OL} strokeWidth={3}>
            <path d={`M100,${226 + ((f * 3) % 60)} q-9,16 0,20 q9,-4 0,-20Z`} />
            <path d={`M200,${226 + ((f * 3 + 30) % 60)} q-9,16 0,20 q9,-4 0,-20Z`} />
          </g>
        )}
        {expr === 'nervous' && <path d={`M248,${120 + (f % 40) / 2} q-14,26 0,30 q14,-4 0,-30Z`} fill="#7CC6FF" stroke={OL} strokeWidth={4} />}
        {extra}
      </svg>
    </div>
  );
};
