import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BG, C, H, OL, W} from '../theme';

export const FLOOR_Y = 1180;

export const Sunburst: React.FC<{a?: string; b?: string; speed?: number}> = ({a = BG.beige, b = BG.beigeLight, speed = 0.12}) => {
  const f = useCurrentFrame();
  const rays = 20;
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

/** Fond uni avec grand disque plus clair au centre. */
export const Vignette: React.FC<{color: string; disc: string; y?: number}> = ({color, disc, y = 820}) => (
  <AbsoluteFill style={{background: color}}>
    <div style={{position: 'absolute', left: 540 - 520, top: y - 520, width: 1040, height: 1040, borderRadius: '50%', background: disc}} />
  </AbsoluteFill>
);

export const Pastel: React.FC<{color: string; dot?: string}> = ({color, dot}) => (
  <AbsoluteFill
    style={{
      background: color,
      backgroundImage: dot ? `radial-gradient(${dot} 8px, transparent 9px)` : undefined,
      backgroundSize: '90px 90px',
    }}
  />
);

/** Parquet façon briques décalées. */
export const Floor: React.FC<{y?: number; color?: string; line?: string}> = ({y = FLOOR_Y, color = BG.floor, line = BG.floorLine}) => (
  <svg style={{position: 'absolute', left: 0, top: y}} width={W} height={H - y}>
    <defs>
      <pattern id="planks" width="300" height="140" patternUnits="userSpaceOnUse">
        <rect width="300" height="140" fill={color} />
        <path d="M0,70 H300 M0,140 H300 M120,0 V70 M270,70 V140 M30,70 V140" stroke={line} strokeWidth={5} />
      </pattern>
    </defs>
    <rect width={W} height={H - y} fill="url(#planks)" />
    <rect width={W} height={26} fill="#fff" stroke={OL} strokeWidth={6} />
  </svg>
);

export const Window: React.FC<{x: number; y: number; w: number; h: number; night?: boolean; curtain?: string}> = ({x, y, w, h, night, curtain = '#3FA98F'}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: night ? 'linear-gradient(#1C1E4A,#3B3C86)' : 'linear-gradient(#7FC4F5,#CDEBFF)',
          border: `9px solid ${OL}`,
          overflow: 'hidden',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {night ? (
            [[20, 20], [40, 34], [80, 18], [62, 44], [12, 50]].map(([sx, sy], i) => (
              <circle key={i} cx={sx} cy={sy} r={1.4} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f / 8 + i)} />
            ))
          ) : (
            <ellipse cx={20 + ((f / 12) % 90)} cy={26} rx={13} ry={5} fill="#fff" />
          )}
          <path d="M0,82 Q25,66 50,78 T100,72 L100,100 L0,100Z" fill={night ? '#4B3B8F' : '#6D5BB0'} />
        </svg>
        <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 9, background: OL, transform: 'translateX(-50%)'}} />
        <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: 9, background: OL, transform: 'translateY(-50%)'}} />
      </div>
      {[-1, 1].map((s) => (
        <div
          key={s}
          style={{
            position: 'absolute',
            top: -16,
            [s < 0 ? 'left' : 'right']: -34,
            width: w * 0.3,
            height: h + 36,
            background: curtain,
            border: `7px solid ${OL}`,
            borderRadius: s < 0 ? '0 0 60px 0' : '0 0 0 60px',
          }}
        />
      ))}
      <div style={{position: 'absolute', top: -34, left: -60, right: -60, height: 20, background: '#9A6A44', border: `6px solid ${OL}`, borderRadius: 10}} />
    </div>
  );
};

export const PictureFrame: React.FC<{x: number; y: number; w: number; h: number; rotate?: number; children?: React.ReactNode}> = ({x, y, w, h, rotate = -3, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: '#A5774F', border: `7px solid ${OL}`, padding: 14, boxSizing: 'border-box', transform: `rotate(${rotate}deg)`}}>
    <div style={{width: '100%', height: '100%', background: '#FFF8EC', border: `5px solid ${OL}`, overflow: 'hidden', position: 'relative'}}>{children}</div>
  </div>
);

export const Lamp: React.FC<{x: number; y: number}> = ({x, y}) => (
  <div style={{position: 'absolute', left: x, top: y}}>
    <div style={{width: 150, height: 100, background: '#F6C445', border: `7px solid ${OL}`, clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)'}} />
    <div style={{width: 12, height: 150, background: OL, marginLeft: 69}} />
  </div>
);

export const Room: React.FC<{
  wall: string;
  stripe: string;
  night?: boolean;
  window?: 'left' | 'right' | false;
  curtain?: string;
  couch?: string;
  lamp?: boolean;
  frame?: React.ReactNode;
  table?: boolean;
}> = ({wall, stripe, night = false, window = 'right', curtain, couch, lamp, frame, table}) => (
  <AbsoluteFill style={{background: wall, backgroundImage: `repeating-linear-gradient(90deg, ${stripe} 0 34px, transparent 34px 92px)`}}>
    {window && <Window x={window === 'right' ? 640 : 110} y={190} w={300} h={380} night={night} curtain={curtain} />}
    {frame && (
      <PictureFrame x={window === 'left' ? 690 : 130} y={250} w={240} h={200}>
        {frame}
      </PictureFrame>
    )}
    {lamp && <Lamp x={window === 'left' ? 820 : 120} y={900} />}
    {couch && (
      <div style={{position: 'absolute', left: 500, top: 960, width: 560, height: 240}}>
        <div style={{position: 'absolute', left: 30, top: 0, width: 500, height: 140, background: couch, border: `8px solid ${OL}`, borderRadius: '46px 46px 10px 10px'}} />
        <div style={{position: 'absolute', left: 0, top: 104, width: 560, height: 110, background: couch, border: `8px solid ${OL}`, borderRadius: 36, filter: 'brightness(0.93)'}} />
      </div>
    )}
    <Floor />
    {table && <Tablecloth />}
  </AbsoluteFill>
);

/** Table avec nappe vichy rouge (devant les personnages : à placer après eux). */
export const Tablecloth: React.FC<{y?: number}> = ({y = 1180}) => (
  <div style={{position: 'absolute', left: -10, top: y, width: W + 20, height: 460}}>
    <div style={{height: 26, background: '#F4E3C8', border: `7px solid ${OL}`}} />
    <div
      style={{
        height: 430,
        borderLeft: `7px solid ${OL}`,
        borderRight: `7px solid ${OL}`,
        borderBottom: `7px solid ${OL}`,
        backgroundColor: '#fff',
        backgroundImage:
          'linear-gradient(90deg, rgba(232,80,91,0.55) 50%, transparent 50%), linear-gradient(rgba(232,80,91,0.55) 50%, transparent 50%)',
        backgroundSize: '62px 62px',
      }}
    />
  </div>
);

export const Lab: React.FC<{board?: React.ReactNode}> = ({board}) => (
  <AbsoluteFill style={{background: '#F6F7F9'}}>
    <svg width={W} height={FLOOR_Y} style={{position: 'absolute'}}>
      <defs>
        <pattern id="bricks" width="160" height="100" patternUnits="userSpaceOnUse">
          <rect width="160" height="100" fill="#F6F7F9" />
          <rect x="6" y="6" width="148" height="38" rx="6" fill="#fff" stroke="#AEB4BF" strokeWidth="4" />
          <rect x="-74" y="56" width="148" height="38" rx="6" fill="#fff" stroke="#AEB4BF" strokeWidth="4" />
          <rect x="86" y="56" width="148" height="38" rx="6" fill="#fff" stroke="#AEB4BF" strokeWidth="4" />
        </pattern>
      </defs>
      <rect width={W} height={FLOOR_Y} fill="url(#bricks)" />
    </svg>
    <div style={{position: 'absolute', left: 60, top: 200, width: 640, height: 420, background: '#2F5A4C', border: `11px solid ${OL}`, borderRadius: 14}}>
      {board}
      <div style={{position: 'absolute', left: 20, right: 20, bottom: -24, height: 16, background: '#C9935F', border: `5px solid ${OL}`}} />
    </div>
    {/* caméra sur trépied */}
    <div style={{position: 'absolute', left: 900, top: 620}}>
      <div style={{width: 130, height: 90, background: '#2E3440', border: `6px solid ${OL}`, borderRadius: 14, position: 'relative'}}>
        <div style={{position: 'absolute', right: -30, top: 14, width: 56, height: 56, borderRadius: '50%', background: '#8FB5D6', border: `6px solid ${OL}`}} />
        <div style={{position: 'absolute', left: 16, top: 16, width: 18, height: 18, borderRadius: '50%', background: '#E8505B'}} />
      </div>
      <svg width={160} height={420} style={{marginLeft: -15}}>
        <path d="M80,0 L20,410 M80,0 L80,410 M80,0 L140,410" stroke="#555B66" strokeWidth={9} />
      </svg>
    </div>
    <div style={{position: 'absolute', left: 0, top: FLOOR_Y, width: W, height: H - FLOOR_Y, background: '#CDD2DA', borderTop: `8px solid ${OL}`}} />
  </AbsoluteFill>
);

export const Bar: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#3A2A4A'}}>
      <svg width={W} height={400} style={{position: 'absolute', top: 60}}>
        <path d="M-20,40 Q270,170 540,70 T1100,60" fill="none" stroke={OL} strokeWidth={5} />
        {Array.from({length: 13}).map((_, i) => {
          const x = i * 90;
          const y = 60 + Math.sin((x / 1080) * Math.PI * 2) * 50 + 30;
          return <circle key={i} cx={x} cy={y} r={14} fill="#FFD84A" opacity={0.6 + 0.4 * Math.sin(f / 5 + i)} stroke={OL} strokeWidth={4} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, top: 560, width: W, height: 26, background: '#7A5236', border: `6px solid ${OL}`}} />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{position: 'absolute', left: 80 + i * 200, top: 446, width: 40, height: 114, background: [C.mint, C.coral, '#F6C445', C.blue, C.pink][i], border: `6px solid ${OL}`, borderRadius: '14px 14px 4px 4px'}} />
      ))}
      <Floor y={FLOOR_Y} color="#7A5236" line="#5E3D27" />
    </AbsoluteFill>
  );
};

/** Cône de projecteur (scènes « révélation »). */
export const Spotlight: React.FC<{x: number; w?: number}> = ({x, w = 520}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: 0,
      width: w,
      height: 1500,
      background: 'linear-gradient(rgba(255,255,255,0.45), rgba(255,255,255,0.12))',
      clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0 100%)',
    }}
  />
);
