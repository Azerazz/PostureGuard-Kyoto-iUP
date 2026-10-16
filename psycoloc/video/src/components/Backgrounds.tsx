import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, H, OL, W} from '../theme';

export const Sunburst: React.FC<{a: string; b: string; speed?: number}> = ({a, b, speed = 0.15}) => {
  const f = useCurrentFrame();
  const rays = 18;
  return (
    <AbsoluteFill style={{background: a, overflow: 'hidden'}}>
      <svg width={W} height={H} viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`}>
        <g transform={`rotate(${f * speed})`}>
          {Array.from({length: rays}).map((_, i) => {
            const a0 = (i / rays) * Math.PI * 2;
            const a1 = a0 + Math.PI / rays;
            const R = 2000;
            return <path key={i} d={`M0,0 L${Math.cos(a0) * R},${Math.sin(a0) * R} L${Math.cos(a1) * R},${Math.sin(a1) * R}Z`} fill={b} />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Pastel: React.FC<{color: string; dot?: string}> = ({color, dot}) => (
  <AbsoluteFill
    style={{
      background: color,
      backgroundImage: dot ? `radial-gradient(${dot} 9px, transparent 10px)` : undefined,
      backgroundSize: '90px 90px',
    }}
  />
);

const FLOOR_Y = 1380;

const Floor: React.FC<{color?: string; dark?: string}> = ({color = C.wood, dark = C.woodDark}) => (
  <div style={{position: 'absolute', left: 0, top: FLOOR_Y, width: W, height: H - FLOOR_Y, background: color, borderTop: `10px solid ${OL}`}}>
    {Array.from({length: 7}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: 0, top: 30 + i * 80, width: W, height: 6, background: dark, opacity: 0.6}} />
    ))}
    {Array.from({length: 14}).map((_, i) => (
      <div key={`v${i}`} style={{position: 'absolute', left: ((i * 263) % W), top: 36 + Math.floor(i / 2) * 80, width: 6, height: 74, background: dark, opacity: 0.6}} />
    ))}
  </div>
);

export const Window: React.FC<{x: number; y: number; w: number; h: number; night?: boolean; curtain?: string}> = ({x, y, w, h, night, curtain = C.coral}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: night ? 'linear-gradient(#1F1B4D,#4A3F8C)' : 'linear-gradient(#9ED8FF,#D8F0FF)',
          border: `10px solid ${OL}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {night ? (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx={70} cy={30} r={12} fill="#FFF3B0" />
            <circle cx={76} cy={26} r={11} fill="#2B2560" />
            {[[20, 20], [40, 60], [80, 70], [25, 80], [55, 15]].map(([sx, sy], i) => (
              <circle key={i} cx={sx} cy={sy} r={1.6} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f / 8 + i)} />
            ))}
          </svg>
        ) : (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <ellipse cx={30 + ((f / 10) % 80)} cy={30} rx={14} ry={6} fill="#fff" />
            <path d="M0,85 Q30,65 60,82 T100,78 L100,100 L0,100Z" fill="#8FD18F" />
          </svg>
        )}
        <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10, background: OL, transform: 'translateX(-50%)'}} />
        <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: 10, background: OL, transform: 'translateY(-50%)'}} />
      </div>
      {[-1, 1].map((s) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            top: -24,
            [s < 0 ? 'left' : 'right']: -40,
            width: w * 0.28,
            height: h + 50,
            background: curtain,
            border: `8px solid ${OL}`,
            borderRadius: '0 0 30px 30px',
          }}
        />
      ))}
      <div style={{position: 'absolute', top: -40, left: -70, right: -70, height: 22, background: C.woodDark, border: `7px solid ${OL}`, borderRadius: 12}} />
    </div>
  );
};

export const Room: React.FC<{wall: string; stripe?: string; night?: boolean; window?: boolean; couch?: string; lamp?: boolean; frame?: boolean}> = ({
  wall,
  stripe,
  night = false,
  window = true,
  couch,
  lamp,
  frame,
}) => (
  <AbsoluteFill
    style={{
      background: wall,
      backgroundImage: stripe ? `repeating-linear-gradient(90deg, ${stripe} 0 40px, transparent 40px 110px)` : undefined,
    }}
  >
    {window && <Window x={600} y={230} w={330} h={400} night={night} />}
    {frame && (
      <div style={{position: 'absolute', left: 130, top: 300, width: 230, height: 180, background: C.yellow, border: `9px solid ${OL}`, borderRadius: 10, transform: 'rotate(-4deg)'}}>
        <svg width="100%" height="100%" viewBox="0 0 100 80">
          <path d="M10,70 L35,35 L55,55 L70,40 L90,70Z" fill={C.mint} stroke={OL} strokeWidth={3} />
          <circle cx={72} cy={22} r={9} fill={C.coral} stroke={OL} strokeWidth={3} />
        </svg>
      </div>
    )}
    {lamp && (
      <div style={{position: 'absolute', left: 90, top: 980}}>
        <div style={{width: 180, height: 120, background: C.yellow, border: `8px solid ${OL}`, clipPath: 'polygon(18% 0, 82% 0, 100% 100%, 0 100%)'}} />
        <div style={{width: 14, height: 280, background: OL, marginLeft: 83}} />
      </div>
    )}
    <div style={{position: 'absolute', left: 0, top: FLOOR_Y - 40, width: W, height: 40, background: '#fff', borderTop: `8px solid ${OL}`}} />
    <Floor />
    {couch && (
      <div style={{position: 'absolute', left: 520, top: 1180, width: 520, height: 260}}>
        <div style={{position: 'absolute', left: 30, top: 0, width: 460, height: 150, background: couch, border: `9px solid ${OL}`, borderRadius: '50px 50px 10px 10px'}} />
        <div style={{position: 'absolute', left: 0, top: 110, width: 520, height: 120, background: couch, border: `9px solid ${OL}`, borderRadius: 40, filter: 'brightness(0.92)'}} />
      </div>
    )}
  </AbsoluteFill>
);

export const Lab: React.FC<{board?: React.ReactNode}> = ({board}) => (
  <AbsoluteFill
    style={{
      background: '#F4F6FA',
      backgroundImage:
        'linear-gradient(#C9CFDB 6px, transparent 6px), linear-gradient(90deg, #C9CFDB 6px, transparent 6px)',
      backgroundSize: '150px 80px, 150px 160px',
      backgroundPosition: '0 0, 75px 0',
    }}
  >
    <div style={{position: 'absolute', left: 70, top: 220, width: 620, height: 400, background: '#2F5D50', border: `12px solid ${OL}`, borderRadius: 16, boxShadow: `0 14px 0 ${OL}`}}>
      {board}
    </div>
    <div style={{position: 'absolute', left: 0, top: FLOOR_Y, width: W, height: H - FLOOR_Y, background: '#C7CDD8', borderTop: `10px solid ${OL}`}} />
  </AbsoluteFill>
);

export const Bar: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.plum}}>
      <svg width={W} height={500} style={{position: 'absolute', top: 120}}>
        <path d="M-20,60 Q270,200 540,90 T1100,80" fill="none" stroke={OL} strokeWidth={6} />
        {Array.from({length: 13}).map((_, i) => {
          const x = i * 90;
          const t = x / 1080;
          const y = 60 + Math.sin(t * Math.PI * 2) * 60 + 40;
          return <circle key={i} cx={x} cy={y} r={16} fill={C.yellow} opacity={0.6 + 0.4 * Math.sin(f / 5 + i)} stroke={OL} strokeWidth={4} />;
        })}
      </svg>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', left: 90 + i * 240, top: 980, width: 46, height: 160, background: [C.mint, C.coral, C.yellow, C.blue][i], border: `7px solid ${OL}`, borderRadius: '16px 16px 6px 6px'}} />
      ))}
      <div style={{position: 'absolute', left: 0, top: 1140, width: W, height: 40, background: C.woodDark, borderTop: `9px solid ${OL}`, borderBottom: `9px solid ${OL}`}} />
      <div style={{position: 'absolute', left: 0, top: 1180, width: W, height: H - 1180, background: '#5A3550'}} />
    </AbsoluteFill>
  );
};
