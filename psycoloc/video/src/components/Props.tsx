import React from 'react';
import {interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_TITLE, OL} from '../theme';

export const usePop = (delay = 0, damping = 11) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, stiffness: 150}});
};

const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: 'absolute',
  left: x,
  top: y,
  ...extra,
});

/** Carte « question » au style flat : bord épais + ombre dure. */
export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  label?: string;
  text?: string;
  big?: string;
  color?: string;
  labelColor?: string;
  delay?: number;
  rotate?: number;
  shake?: number;
  fontSize?: number;
}> = ({x, y, w, label, text, big, color = C.white, labelColor = C.coral, delay = 0, rotate = 0, shake = 0, fontSize = 64}) => {
  const f = useCurrentFrame();
  const p = usePop(delay);
  const sx = shake ? Math.sin(f * 1.7) * shake : 0;
  return (
    <div
      style={abs(x - w / 2 + sx, y, {
        width: w,
        transform: `scale(${p}) rotate(${rotate + (shake ? Math.sin(f * 1.3) * shake * 0.15 : 0)}deg)`,
        transformOrigin: '50% 50%',
      })}
    >
      <div
        style={{
          background: color,
          border: `8px solid ${OL}`,
          borderRadius: 44,
          boxShadow: `0 16px 0 ${OL}`,
          padding: label ? '78px 54px 56px' : '48px 54px',
          fontFamily: FONT_TITLE,
          color: OL,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {label && (
          <div
            style={{
              position: 'absolute',
              top: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              background: labelColor,
              color: '#fff',
              border: `7px solid ${OL}`,
              borderRadius: 999,
              padding: '6px 34px',
              fontSize: 46,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              letterSpacing: 1,
            }}
          >
            {label}
          </div>
        )}
        {big && <div style={{fontSize: 240, fontWeight: 700, lineHeight: 1}}>{big}</div>}
        {text && <div style={{fontSize, fontWeight: 600, lineHeight: 1.18}}>{text}</div>}
      </div>
    </div>
  );
};

export const Pill: React.FC<{x: number; y: number; text: string; bg?: string; color?: string; size?: number; delay?: number; rotate?: number}> = ({
  x,
  y,
  text,
  bg = C.yellow,
  color = OL,
  size = 64,
  delay = 0,
  rotate = 0,
}) => {
  const p = usePop(delay);
  return (
    <div style={abs(x, y, {transform: `translate(-50%,-50%) scale(${p}) rotate(${rotate}deg)`})}>
      <div
        style={{
          background: bg,
          color,
          border: `7px solid ${OL}`,
          borderRadius: 999,
          boxShadow: `0 10px 0 ${OL}`,
          padding: `${size * 0.2}px ${size * 0.6}px`,
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          fontSize: size,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Gros texte en relief (chiffres clés). */
export const BigText: React.FC<{x: number; y: number; text: string; size: number; color?: string; delay?: number; wobble?: boolean}> = ({
  x,
  y,
  text,
  size,
  color = C.white,
  delay = 0,
  wobble = true,
}) => {
  const f = useCurrentFrame();
  const p = usePop(delay, 8);
  const r = wobble ? Math.sin(f / 7) * 3 : 0;
  return (
    <div
      style={abs(x, y, {
        transform: `translate(-50%,-50%) scale(${p}) rotate(${r}deg)`,
        fontFamily: FONT_TITLE,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        color,
        WebkitTextStroke: `${size * 0.045}px ${OL}`,
        paintOrder: 'stroke fill',
        textShadow: `0 ${size * 0.05}px 0 ${OL}`,
        whiteSpace: 'nowrap',
      })}
    >
      {text}
    </div>
  );
};

export const HeartPath = 'M0,30 C-60,-10 -34,-62 0,-30 C34,-62 60,-10 0,30Z';

export const Heart: React.FC<{x: number; y: number; size: number; delay?: number; color?: string; beat?: boolean}> = ({x, y, size, delay = 0, color = C.coral, beat = true}) => {
  const f = useCurrentFrame();
  const p = usePop(delay, 7);
  const b = beat ? 1 + Math.max(0, Math.sin(f / 4)) * 0.08 : 1;
  return (
    <svg style={abs(x - size / 2, y - size / 2, {width: size, height: size, transform: `scale(${p * b})`, overflow: 'visible'})} viewBox="-60 -64 120 110">
      <path d={HeartPath} fill={color} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={-22} cy={-26} rx={9} ry={6} fill="#fff" opacity={0.7} transform="rotate(-30 -22 -26)" />
    </svg>
  );
};

/** Petits cœurs qui montent (boucle). */
export const FloatingHearts: React.FC<{n?: number; seed?: string; area?: [number, number, number, number]}> = ({n = 10, seed = 'h', area = [80, 200, 920, 1500]}) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const x = area[0] + random(`${seed}x${i}`) * (area[2] - area[0]);
        const speed = 3 + random(`${seed}s${i}`) * 4;
        const span = area[3] - area[1];
        const y = area[3] - ((f * speed + random(`${seed}y${i}`) * span) % span);
        const s = 50 + random(`${seed}z${i}`) * 50;
        return (
          <svg key={i} style={abs(x, y, {width: s, height: s, transform: `rotate(${Math.sin(f / 10 + i) * 15}deg)`, opacity: 0.9})} viewBox="-60 -64 120 110">
            <path d={HeartPath} fill={i % 3 ? C.coral : C.pink} stroke={OL} strokeWidth={7} />
          </svg>
        );
      })}
    </>
  );
};

export const Sparkle: React.FC<{x: number; y: number; size: number; delay?: number; color?: string}> = ({x, y, size, delay = 0, color = C.yellow}) => {
  const f = useCurrentFrame();
  const p = usePop(delay, 9);
  const s = p * (0.8 + Math.abs(Math.sin((f + delay * 3) / 6)) * 0.3);
  return (
    <svg style={abs(x - size / 2, y - size / 2, {width: size, height: size, transform: `scale(${s}) rotate(${f * 2}deg)`, overflow: 'visible'})} viewBox="-50 -50 100 100">
      <path d="M0,-46 Q8,-8 46,0 Q8,8 0,46 Q-8,8 -46,0 Q-8,-8 0,-46Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
};

export const Confetti: React.FC<{n?: number; seed?: string}> = ({n = 60, seed = 'c'}) => {
  const f = useCurrentFrame();
  const cols = [C.coral, C.yellow, C.mint, C.blue, C.purple, C.pink];
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const x = random(`${seed}${i}x`) * 1080 + Math.sin(f / 12 + i) * 30;
        const y = -100 + ((f * (6 + random(`${seed}${i}v`) * 8) + random(`${seed}${i}y`) * 2000) % 2100);
        return (
          <div
            key={i}
            style={abs(x, y, {
              width: 22,
              height: 34,
              borderRadius: 6,
              background: cols[i % cols.length],
              border: `4px solid ${OL}`,
              transform: `rotate(${f * 8 + i * 40}deg)`,
            })}
          />
        );
      })}
    </>
  );
};

/** Jauge horizontale « intimité ». */
export const Meter: React.FC<{x: number; y: number; w: number; value: number; label?: string; delay?: number}> = ({x, y, w, value, label = 'INTIMITÉ', delay = 0}) => {
  const f = useCurrentFrame();
  const p = usePop(delay);
  const v = interpolate(f - delay, [6, 40], [0, value], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const col = v < 0.4 ? C.blue : v < 0.7 ? C.yellow : C.coral;
  return (
    <div style={abs(x - w / 2, y, {width: w, transform: `scale(${p})`})}>
      <div style={{fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 44, color: OL, marginBottom: 10, display: 'flex', justifyContent: 'space-between'}}>
        <span>{label}</span>
        <span>{v > 0.75 ? '🔥' : v > 0.4 ? '🙂' : '🧊'}</span>
      </div>
      <div style={{height: 56, background: '#fff', border: `7px solid ${OL}`, borderRadius: 999, overflow: 'hidden', boxShadow: `0 8px 0 ${OL}`}}>
        <div style={{width: `${v * 100}%`, height: '100%', background: col, borderRight: v > 0.02 ? `6px solid ${OL}` : undefined}} />
      </div>
    </div>
  );
};

export const Bubble: React.FC<{x: number; y: number; w: number; text?: string; side?: 'L' | 'R'; delay?: number; color?: string; size?: number; lines?: number}> = ({
  x,
  y,
  w,
  text,
  side = 'L',
  delay = 0,
  color = '#fff',
  size = 56,
  lines = 0,
}) => {
  const p = usePop(delay);
  return (
    <div style={abs(x - w / 2, y, {width: w, transform: `scale(${p})`, transformOrigin: side === 'L' ? '20% 100%' : '80% 100%'})}>
      <div
        style={{
          background: color,
          border: `7px solid ${OL}`,
          borderRadius: 48,
          padding: '28px 36px',
          fontFamily: FONT_TITLE,
          fontWeight: 600,
          fontSize: size,
          color: OL,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {text}
        {Array.from({length: lines}).map((_, i) => (
          <div key={i} style={{height: 14, borderRadius: 8, background: OL, opacity: 0.8, margin: '14px auto', width: `${90 - i * 18}%`}} />
        ))}
        <svg
          viewBox="0 0 60 50"
          style={{position: 'absolute', bottom: -44, [side === 'L' ? 'left' : 'right']: 60, width: 60, height: 50, transform: side === 'R' ? 'scaleX(-1)' : undefined}}
        >
          <path d="M0,0 L60,0 L8,46 Z" fill={color} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
          <rect x={4} y={-6} width={52} height={10} fill={color} />
        </svg>
      </div>
    </div>
  );
};

/** Mascotte cerveau (aussi utilisée dans le logo). */
export const BrainSvg: React.FC<{expr?: 'happy' | 'love' | 'smug'; f?: number; roof?: boolean}> = ({expr = 'happy', f = 0, roof = false}) => {
  const lobes: [number, number, number][] = [
    [-120, 10, 80],
    [-70, -60, 85],
    [10, -85, 90],
    [90, -55, 85],
    [130, 15, 78],
    [80, 75, 80],
    [-10, 85, 85],
    [-95, 70, 72],
    [0, 0, 110],
  ];
  return (
    <g>
      {roof && (
        <g stroke={OL} strokeWidth={9} strokeLinejoin="round" transform="translate(0,-62)">
          <rect x={70} y={-250} width={44} height={80} fill={C.coralDark} />
          <path d="M-175,-110 L0,-245 L175,-110 Q180,-92 160,-92 L-160,-92 Q-180,-92 -175,-110Z" fill={C.coral} />
          <path d="M-120,-118 L0,-210 L120,-118" fill="none" stroke="#fff" strokeWidth={8} opacity={0.45} strokeLinecap="round" />
        </g>
      )}
      <g fill="none" stroke={OL} strokeWidth={20}>
        {lobes.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g fill={C.pink}>
        {lobes.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g fill="none" stroke="#E46E9A" strokeWidth={9} strokeLinecap="round">
        <path d="M-150,-10 Q-120,-40 -90,-20" />
        <path d="M-60,-110 Q-40,-80 -60,-50" />
        <path d="M40,-130 Q30,-100 60,-80" />
        <path d="M150,10 Q120,-20 100,10" />
        <path d="M60,120 Q40,95 70,70" />
        <path d="M-60,120 Q-40,100 -70,80" />
      </g>
      {expr === 'love' ? (
        <g fill={C.coral} stroke={OL} strokeWidth={6}>
          <path transform="translate(-50,0) scale(0.75)" d={HeartPath} />
          <path transform="translate(50,0) scale(0.75)" d={HeartPath} />
        </g>
      ) : (
        <g>
          <circle cx={-50} cy={0} r={30} fill="#fff" stroke={OL} strokeWidth={7} />
          <circle cx={50} cy={0} r={30} fill="#fff" stroke={OL} strokeWidth={7} />
          <circle cx={-46 + Math.sin(f / 20) * 3} cy={6} r={14} fill={OL} />
          <circle cx={54 + Math.sin(f / 20) * 3} cy={6} r={14} fill={OL} />
          <circle cx={-41} cy={0} r={5} fill="#fff" />
          <circle cx={59} cy={0} r={5} fill="#fff" />
        </g>
      )}
      <ellipse cx={-92} cy={42} rx={22} ry={12} fill="#FF5E7E" opacity={0.45} />
      <ellipse cx={92} cy={42} rx={22} ry={12} fill="#FF5E7E" opacity={0.45} />
      {expr === 'smug' ? (
        <path d="M-30,52 Q10,72 36,42" fill="none" stroke={OL} strokeWidth={9} strokeLinecap="round" />
      ) : (
        <path d="M-36,46 Q0,92 36,46 Q0,58 -36,46Z" fill="#7A2A3A" stroke={OL} strokeWidth={7} strokeLinejoin="round" />
      )}
    </g>
  );
};

export const Brain: React.FC<{x: number; y: number; size: number; expr?: 'happy' | 'love' | 'smug'; delay?: number; roof?: boolean}> = ({x, y, size, expr, delay = 0, roof}) => {
  const f = useCurrentFrame();
  const p = usePop(delay, 9);
  const s = p * (1 + Math.sin(f / 7) * 0.025);
  return (
    <svg style={abs(x - size / 2, y - size / 2, {width: size, height: size, transform: `scale(${s})`, overflow: 'visible'})} viewBox="-230 -260 460 460">
      <BrainSvg expr={expr} f={f} roof={roof} />
    </svg>
  );
};

export const Phone: React.FC<{x: number; y: number; w: number; delay?: number; children?: React.ReactNode}> = ({x, y, w, delay = 0, children}) => {
  const p = usePop(delay);
  const h = w * 1.9;
  return (
    <div style={abs(x - w / 2, y, {width: w, height: h, transform: `scale(${p})`})}>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: OL,
          borderRadius: 70,
          padding: 22,
          boxSizing: 'border-box',
          boxShadow: `0 18px 0 rgba(0,0,0,0.25)`,
        }}
      >
        <div style={{width: '100%', height: '100%', borderRadius: 52, background: C.cream, position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', width: 120, height: 30, borderRadius: 20, background: OL}} />
          {children}
        </div>
      </div>
    </div>
  );
};

export const Newspaper: React.FC<{x: number; y: number; w: number; delay?: number}> = ({x, y, w, delay = 0}) => {
  const f = useCurrentFrame();
  const p = usePop(delay, 13);
  const r = interpolate(p, [0, 1], [-40, -4]);
  return (
    <div style={abs(x - w / 2, y, {width: w, transform: `scale(${p}) rotate(${r + Math.sin(f / 15) * 1.5}deg)`})}>
      <div style={{background: '#FBF7EE', border: `8px solid ${OL}`, borderRadius: 18, boxShadow: `0 16px 0 ${OL}`, padding: '34px 44px', color: OL}}>
        <div style={{fontFamily: "'DejaVu Serif', serif", fontWeight: 700, fontSize: 58, textAlign: 'center', borderBottom: `6px solid ${OL}`, paddingBottom: 14}}>
          The New York Times
        </div>
        <div style={{fontFamily: FONT_TITLE, fontSize: 34, fontWeight: 600, textAlign: 'center', margin: '10px 0 18px', opacity: 0.7}}>CHRONIQUE · 2015</div>
        <div style={{fontFamily: FONT_TITLE, fontSize: 70, fontWeight: 700, lineHeight: 1.05, textAlign: 'center'}}>« Tomber amoureux de n'importe qui »</div>
        <div style={{display: 'flex', gap: 24, marginTop: 26}}>
          <div style={{flex: 1}}>
            {[100, 90, 96, 70].map((wd, i) => (
              <div key={i} style={{height: 12, width: `${wd}%`, background: OL, opacity: 0.35, borderRadius: 6, marginBottom: 14}} />
            ))}
          </div>
          <div style={{width: 170, height: 110, borderRadius: 12, background: C.pinkLight, border: `5px solid ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={80} height={70} viewBox="-60 -64 120 110">
              <path d={HeartPath} fill={C.coral} stroke={OL} strokeWidth={8} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Rings: React.FC<{x: number; y: number; size: number; delay?: number}> = ({x, y, size, delay = 0}) => {
  const f = useCurrentFrame();
  const p = usePop(delay, 8);
  return (
    <svg style={abs(x - size / 2, y - size / 2, {width: size, height: size, transform: `scale(${p}) rotate(${Math.sin(f / 9) * 6}deg)`, overflow: 'visible'})} viewBox="-150 -130 300 260">
      <circle cx={-48} cy={20} r={80} fill="none" stroke={OL} strokeWidth={42} />
      <circle cx={-48} cy={20} r={80} fill="none" stroke="#FFC93C" strokeWidth={26} />
      <circle cx={48} cy={20} r={80} fill="none" stroke={OL} strokeWidth={42} />
      <circle cx={48} cy={20} r={80} fill="none" stroke="#FFC93C" strokeWidth={26} />
      <path d="M-20,-62 A80,80 0 0 1 -6,-40" stroke="#FFC93C" strokeWidth={26} fill="none" />
      <path d="M-48,-90 L-30,-62 L-48,-50 L-66,-62Z" fill="#BDF3FF" stroke={OL} strokeWidth={6} strokeLinejoin="round" transform="translate(0,-20)" />
    </svg>
  );
};

export const Clock: React.FC<{x: number; y: number; size: number; speed?: number}> = ({x, y, size, speed = 1}) => {
  const f = useCurrentFrame();
  return (
    <svg style={abs(x - size / 2, y - size / 2, {width: size, height: size})} viewBox="-60 -60 120 120">
      <circle r={52} fill="#fff" stroke={OL} strokeWidth={7} />
      {Array.from({length: 12}).map((_, i) => (
        <circle key={i} cx={Math.cos((i / 12) * Math.PI * 2) * 40} cy={Math.sin((i / 12) * Math.PI * 2) * 40} r={3} fill={OL} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-24} stroke={OL} strokeWidth={7} strokeLinecap="round" transform={`rotate(${f * speed * 1.2})`} />
      <line x1={0} y1={0} x2={0} y2={-36} stroke={C.coral} strokeWidth={5} strokeLinecap="round" transform={`rotate(${f * speed * 14})`} />
      <circle r={5} fill={OL} />
    </svg>
  );
};

export const Warning: React.FC<{x: number; y: number; size: number; delay?: number}> = ({x, y, size, delay = 0}) => {
  const f = useCurrentFrame();
  const p = usePop(delay, 7);
  return (
    <svg style={abs(x - size / 2, y - size / 2, {width: size, height: size, transform: `scale(${p}) rotate(${Math.sin(f / 3) * 4}deg)`, overflow: 'visible'})} viewBox="-110 -110 220 210">
      <path d="M0,-96 L100,80 Q104,92 90,92 L-90,92 Q-104,92 -100,80 Z" fill={C.yellow} stroke={OL} strokeWidth={12} strokeLinejoin="round" />
      <rect x={-12} y={-40} width={24} height={80} rx={12} fill={OL} />
      <circle cx={0} cy={66} r={14} fill={OL} />
    </svg>
  );
};

export const Mug: React.FC<{x: number; y: number; size: number}> = ({x, y, size}) => {
  const f = useCurrentFrame();
  return (
    <svg style={abs(x - size / 2, y - size / 2, {width: size, height: size, overflow: 'visible'})} viewBox="-60 -80 130 140">
      <path d="M-40,-20 L40,-20 L34,50 Q32,58 24,58 L-24,58 Q-32,58 -34,50Z" fill={C.coral} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
      <path d="M40,-5 Q66,0 60,24 Q56,40 36,38" fill="none" stroke={OL} strokeWidth={7} />
      {[0, 1].map((i) => (
        <path
          key={i}
          d={`M${-12 + i * 22},-32 q-10,-14 0,-26 q10,-12 0,-24`}
          fill="none"
          stroke="#fff"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.5 + 0.5 * Math.sin(f / 6 + i)}
        />
      ))}
    </svg>
  );
};
