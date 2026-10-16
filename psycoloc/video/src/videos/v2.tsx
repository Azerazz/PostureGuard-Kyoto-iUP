import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {Lab, Room, Sunburst, Vignette} from '../components/Backgrounds';
import {Character} from '../components/Character';
import {Brain, Bubble, Phone, Pill, Sparkle, usePop} from '../components/Props';
import {BG, FONT_TITLE, OL} from '../theme';
import {Outro} from './v1';

type P = {d: number};

const FEET = 1460;
const HH = 900;

/* ---------- accessoires propres à l'épisode ---------- */

/** Faux détecteur de mensonges : écran à tracé défilant, cadran, voyant. */
const LieDetector: React.FC<{x: number; y: number; w: number; crazy?: number; delay?: number; label?: string}> = ({x, y, w, crazy = 0.2, delay = 0, label = 'DÉTECTEUR'}) => {
  const f = useCurrentFrame();
  const p = usePop(delay);
  const pts = Array.from({length: 40}, (_, i) => {
    const t = f * 0.6 + i;
    const amp = 8 + crazy * 60;
    const jitter = (random(`ld${Math.floor(t)}`) - 0.5) * amp * 2;
    return `${i * 10},${50 + Math.sin(t * 0.7) * amp * 0.4 + jitter}`;
  }).join(' ');
  const needle = -40 + crazy * 80 + Math.sin(f * (0.3 + crazy)) * (10 + crazy * 30);
  const light = crazy > 0.6 ? (Math.floor(f / 3) % 2 ? '#F0506E' : '#FFD84A') : '#5ED39A';
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: `scale(${p}) rotate(${crazy > 0.6 ? Math.sin(f * 2.3) * 2 : 0}deg)`}}>
      <div style={{background: '#5C6B7A', border: `8px solid ${OL}`, borderRadius: 28, padding: 22, boxShadow: `0 12px 0 ${OL}`}}>
        <div style={{display: 'flex', gap: 18, alignItems: 'center'}}>
          <svg viewBox="0 0 390 100" style={{flex: 1, height: w * 0.26, background: '#FFFDF4', border: `6px solid ${OL}`, borderRadius: 12}}>
            {[20, 50, 80].map((g) => (
              <line key={g} x1={0} x2={390} y1={g} y2={g} stroke="#F3B3CA" strokeWidth={2} />
            ))}
            <polyline points={pts} fill="none" stroke="#E8505B" strokeWidth={4} strokeLinejoin="round" />
          </svg>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
            <svg width={w * 0.2} height={w * 0.13} viewBox="-60 -60 120 70">
              <path d="M-52,0 A52,52 0 0 1 52,0 Z" fill="#fff" stroke={OL} strokeWidth={6} />
              <line x1={0} y1={0} x2={0} y2={-42} stroke="#E8505B" strokeWidth={6} strokeLinecap="round" transform={`rotate(${needle})`} />
              <circle r={7} fill={OL} />
            </svg>
            <div style={{width: w * 0.08, height: w * 0.08, borderRadius: '50%', background: light, border: `6px solid ${OL}`, boxShadow: `0 0 ${crazy > 0.6 ? 30 : 10}px ${light}`}} />
          </div>
        </div>
        <div style={{marginTop: 12, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: w * 0.07, color: '#fff', letterSpacing: 2}}>{label}</div>
      </div>
    </div>
  );
};

/** Passoire-casque pour le détecteur maison de Théo (coordonnées du personnage). */
const ColanderHat: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <g>
      <path d="M150,-30 L150,-80" stroke={OL} strokeWidth={6} />
      <circle cx={150} cy={-86} r={14} fill={Math.floor(f / 6) % 2 ? '#F0506E' : '#FFD84A'} stroke={OL} strokeWidth={5} />
      <rect x={6} y={78} width={34} height={20} rx={8} fill="#B8BEC8" stroke={OL} strokeWidth={5} />
      <rect x={260} y={78} width={34} height={20} rx={8} fill="#B8BEC8" stroke={OL} strokeWidth={5} />
      <path d="M30,100 A122,128 0 0 1 270,100 Z" fill="#C9CED6" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      {[[90, 40], [130, 20], [170, 20], [210, 40], [70, 76], [115, 60], [150, 52], [185, 60], [230, 76]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={7} fill="#8E95A1" />
      ))}
    </g>
  );
};

const Toaster: React.FC<{x: number; y: number; w: number; boom?: boolean}> = ({x, y, w, boom}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: boom ? `rotate(${Math.sin(f * 2.5) * 6}deg)` : undefined}}>
      {boom && (
        <div style={{position: 'absolute', left: '50%', top: -w * 0.75, transform: 'translateX(-50%)', fontSize: w * 0.6}}>
          {Math.floor(f / 4) % 2 ? '💥' : '⚡'}
        </div>
      )}
      <div style={{height: w * 0.62, background: '#E8ECF2', border: `8px solid ${OL}`, borderRadius: '40px 40px 14px 14px', position: 'relative'}}>
        <div style={{position: 'absolute', left: '18%', right: '18%', top: -10, height: 18, background: OL, borderRadius: 9}} />
        <div style={{position: 'absolute', right: -26, top: '35%', width: 30, height: 16, background: OL, borderRadius: 8}} />
      </div>
    </div>
  );
};

const Sheet: React.FC<{x: number; y: number; w: number; value?: string; rotate?: number; delay?: number}> = ({x, y, w, value = '', rotate = -4, delay = 0}) => {
  const p = usePop(delay);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: `scale(${p}) rotate(${rotate}deg)`, background: '#fff', border: `7px solid ${OL}`, borderRadius: 14, padding: '26px 30px', fontFamily: FONT_TITLE, color: OL}}>
      <div style={{fontSize: w * 0.075, fontWeight: 700}}>QUESTIONNAIRE</div>
      <div style={{height: 10, background: OL, opacity: 0.25, borderRadius: 5, margin: '14px 0'}} />
      <div style={{fontSize: w * 0.07, fontWeight: 600}}>
        Nombre de partenaires : <span style={{color: '#E8505B', fontWeight: 700, fontSize: w * 0.1}}>{value || '…'}</span>
      </div>
    </div>
  );
};

const Stamp: React.FC<{x: number; y: number; text: string; delay?: number}> = ({x, y, text, delay = 0}) => {
  const f = useCurrentFrame();
  const s = interpolate(f - delay, [0, 6], [2.4, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o = f < delay ? 0 : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(-14deg) scale(${s})`, opacity: o, border: '12px solid #E8505B', borderRadius: 20, padding: '6px 34px', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 120, color: '#E8505B', background: 'rgba(255,255,255,0.75)', letterSpacing: 6}}>
      {text}
    </div>
  );
};

/** Deux barres (moyennes déclarées). */
const Bars: React.FC<{a: number; b: number | null; la: string; lb: string; ca: string; cb: string; va?: string; vb?: string; max?: number}> = ({a, b, la, lb, ca, cb, va, vb, max = 5}) => {
  const f = useCurrentFrame();
  const H = 640;
  const ha = interpolate(f, [2, 18], [0, (a / max) * H], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hb = b === null ? 0 : interpolate(f, [4, 26], [0, (b / max) * H], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bar = (x: number, h: number, color: string, label: string, val?: string) => (
    <>
      <div style={{position: 'absolute', left: x - 140, top: 1110 - h, width: 280, height: h, background: color, border: `8px solid ${OL}`, borderRadius: '26px 26px 0 0'}} />
      {val && h > 40 && <div style={{position: 'absolute', left: x - 150, top: 1110 - h - 120, width: 300, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 100, color: '#fff', WebkitTextStroke: `8px ${OL}`, paintOrder: 'stroke fill'}}>{val}</div>}
      <div style={{position: 'absolute', left: x - 230, top: 1130, width: 460, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 48, color: OL}}>{label}</div>
    </>
  );
  return (
    <>
      <div style={{position: 'absolute', left: 90, top: 1106, width: 900, height: 10, background: OL, borderRadius: 6}} />
      {bar(320, ha, ca, la, va)}
      {bar(760, hb, cb, lb, vb)}
    </>
  );
};

/* ---------- scènes ---------- */

const Hook: React.FC<P> = () => (
  <AbsoluteFill>
    <Sunburst />
    <LieDetector x={540} y={170} w={720} crazy={0.35} />
    <Character who="ines" x={300} y={FEET} h={HH} expr="nervous" look={6} delay={4} />
    <Character who="theo" x={790} y={FEET} h={HH} expr="smug" flip look={6} delay={8} />
    <Pill x={540} y={700} text="Ton nombre ? 👀" bg="#fff" delay={14} size={58} />
  </AbsoluteFill>
);

const Couple: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Room wall={BG.nightWall} stripe={BG.nightWall2} night couch="#F0646A" lamp curtain="#F6C445" />
      <Character who="ines" x={330} y={FEET} h={HH} expr={f > d * 0.6 ? 'wow' : 'love'} />
      <Character who="theo" x={780} y={FEET} h={HH} expr={f > d * 0.6 ? 'smug' : 'love'} flip talking={f > d * 0.6} />
      {f > d * 0.6 && <Bubble x={720} y={360} w={480} text="C'est quoi ton nombre ? 👀" side="R" />}
      {f <= d * 0.6 && <Pill x={540} y={560} text="💑 3 mois" bg="#fff" size={56} />}
    </AbsoluteFill>
  );
};

const Ines: React.FC<P> = () => (
  <AbsoluteFill>
    <Room wall={BG.nightWall} stripe={BG.nightWall2} night couch="#F0646A" lamp curtain="#F6C445" />
    <Character who="ines" x={330} y={FEET} h={HH} expr="nervous" talking />
    <Character who="theo" x={780} y={FEET} h={HH} expr="annoyed" flip arms={['cross', 'cross']} />
    <Bubble x={330} y={360} w={300} text="3 !" side="L" size={110} />
    <Sparkle x={520} y={420} size={60} delay={10} />
  </AbsoluteFill>
);

const Theo: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Room wall={BG.nightWall} stripe={BG.nightWall2} night couch="#F0646A" lamp curtain="#F6C445" />
      <Character who="ines" x={300} y={FEET} h={HH} expr="annoyed" arms={['hip', 'hip']} />
      <Character who="theo" x={780} y={FEET} h={HH} expr="happy" flip talking arms={['down', 'up']} />
      <Bubble x={760} y={250} w={300} text="7 😎" side="R" size={110} />
      {f > d * 0.35 && <Pill x={300} y={300} text="💋 bisou en colo" bg="#fff" size={46} rotate={-5} />}
      {f > d * 0.65 && <Pill x={320} y={430} text="😊 sourire au mariage" bg="#fff" size={46} rotate={4} />}
    </AbsoluteFill>
  );
};

const LabScene: React.FC<P> = () => (
  <AbsoluteFill>
    <Lab
      board={
        <div style={{fontFamily: FONT_TITLE, color: '#fff', padding: '34px 44px'}}>
          <div style={{fontSize: 140, fontWeight: 700, lineHeight: 1}}>2003</div>
          <div style={{fontSize: 56, fontWeight: 600, marginTop: 20}}>~200 étudiants · 3 situations</div>
        </div>
      }
    />
    <Character who="prof" x={800} y={FEET} h={HH} expr="smile" arms={['point', 'down']} flip />
    <Character who="studentA" x={160} y={FEET + 30} h={720} expr="wow" delay={8} />
    <Character who="studentB" x={420} y={FEET + 30} h={720} expr="nervous" delay={16} flip />
  </AbsoluteFill>
);

const Cond1: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Vignette color="#93B6EE" disc="#C8DAF7" y={700} />
      <Pill x={540} y={150} text="1 · Quelqu'un peut lire 👀" bg="#fff" size={54} />
      <Sheet x={540} y={300} w={640} value="2" />
      {[[110, 640], [960, 700], [140, 1000], [940, 1050]].map(([x, y], i) => (
        <div key={i} style={{position: 'absolute', left: x - 70, top: y + Math.sin(f / 6 + i) * 10, fontSize: 120}}>👀</div>
      ))}
      <Character who="studentB" x={540} y={FEET} h={HH} expr="nervous" />
    </AbsoluteFill>
  );
};

const Cond2: React.FC<P> = () => (
  <AbsoluteFill>
    <Vignette color="#B9E0CF" disc="#DDF2E8" y={700} />
    <Pill x={540} y={150} text="2 · Anonyme 🔒" bg="#fff" size={54} />
    <div style={{position: 'absolute', left: 540 - 220, top: 340, width: 440, height: 300, background: '#4E7FE0', border: `8px solid ${OL}`, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 64, color: '#fff'}}>
      <div style={{position: 'absolute', top: -16, width: 220, height: 24, background: OL, borderRadius: 12}} />
      ANONYME
    </div>
    <Character who="studentB" x={540} y={FEET} h={HH} expr="smile" />
  </AbsoluteFill>
);

const Cond3: React.FC<P> = ({d}) => (
  <AbsoluteFill>
    <Vignette color="#F7C3D6" disc="#FBE1EB" y={700} />
    <Pill x={540} y={140} text="3 · Détecteur de mensonges 🔌" bg="#fff" size={52} />
    <LieDetector x={540} y={240} w={640} crazy={0.3} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <path d="M380,560 Q300,760 470,900" fill="none" stroke={OL} strokeWidth={10} />
      <path d="M700,560 Q790,760 610,900" fill="none" stroke={OL} strokeWidth={10} />
    </svg>
    <Character who="studentB" x={540} y={FEET} h={HH} expr="wow" />
    <Stamp x={540} y={420} text="FAUX" delay={Math.round(d * 0.62)} />
  </AbsoluteFill>
);

const Result: React.FC<P> = () => (
  <AbsoluteFill>
    <Vignette color="#DCD3FB" disc="#EEE9FF" y={700} />
    <Pill x={540} y={190} text="Partenaires déclarés (femmes)" bg="#fff" size={52} />
    <Bars a={2.6} b={null} la="Lues 👀" lb="Fausse machine 🔌" ca="#93B6EE" cb="#F0646A" va="2,6" />
  </AbsoluteFill>
);

const Result2: React.FC<P> = () => (
  <AbsoluteFill>
    <Vignette color="#DCD3FB" disc="#EEE9FF" y={700} />
    <Pill x={540} y={190} text="Partenaires déclarés (femmes)" bg="#fff" size={52} />
    <Bars a={2.6} b={4.4} la="Lues 👀" lb="Fausse machine 🔌" ca="#93B6EE" cb="#F0646A" va="2,6" vb="4,4" />
    <Pill x={850} y={330} text="≈ x2 !" bg="#FFD84A" size={70} delay={20} rotate={8} />
  </AbsoluteFill>
);

const Men: React.FC<P> = () => (
  <AbsoluteFill>
    <Vignette color="#C8DAF7" disc="#E4EEFC" y={700} />
    <Pill x={540} y={190} text="Et chez les hommes ?" bg="#fff" size={52} />
    <Bars a={3.8} b={4.0} la="Lus 👀" lb="Fausse machine 🔌" ca="#93B6EE" cb="#4E7FE0" />
    <Pill x={540} y={360} text="Écart bien plus petit 🤷" bg="#FFD84A" size={60} delay={14} />
  </AbsoluteFill>
);

const Reason: React.FC<P> = () => (
  <AbsoluteFill>
    <Lab
      board={
        <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'space-around', fontFamily: FONT_TITLE, color: '#fff'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 120}}>🙋‍♀️</div>
            <div style={{fontSize: 70}}>👎👎👎</div>
          </div>
          <div style={{fontSize: 90, fontWeight: 700}}>≠</div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 120}}>🙋‍♂️</div>
            <div style={{fontSize: 70}}>👍👍</div>
          </div>
        </div>
      }
    />
    <Character who="prof" x={830} y={FEET} h={HH} expr="annoyed" arms={['point', 'down']} flip talking />
    <Character who="ines" x={230} y={FEET + 30} h={760} expr="sad" delay={6} />
  </AbsoluteFill>
);

const Round: React.FC<P> = () => (
  <AbsoluteFill>
    <Vignette color={BG.pinkWall} disc="#FBE1EB" y={700} />
    <Brain x={540} y={650} size={720} expr="smug" />
    <Pill x={540} y={1450} text="4,4 ➜ 2,6 🤫" bg="#fff" size={64} delay={6} />
  </AbsoluteFill>
);

const Twist: React.FC<P> = () => (
  <AbsoluteFill>
    <Room wall={BG.peachWall} stripe={BG.peachWall2} window="left" curtain="#4E7FE0" />
    <Character who="theo" x={330} y={FEET} h={HH} expr="happy" arms={['up', 'down']} extra={<ColanderHat />} />
    <Character who="ines" x={880} y={FEET + 40} h={760} expr="annoyed" arms={['cross', 'cross']} flip delay={6} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <path d="M330,480 Q560,420 600,1090" fill="none" stroke="#E8505B" strokeWidth={9} />
    </svg>
    <Toaster x={600} y={1090} w={220} />
    <Pill x={760} y={400} text="v1.0 « maison » 🔧" bg="#fff" size={46} rotate={5} />
  </AbsoluteFill>
);

const Twist2: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  const boom = f > d * 0.35;
  return (
    <AbsoluteFill>
      <Room wall={BG.peachWall} stripe={BG.peachWall2} window="left" curtain="#4E7FE0" />
      {boom && <AbsoluteFill style={{background: '#FFF6C2', opacity: Math.floor(f / 3) % 2 ? 0.35 : 0}} />}
      <Character who="theo" x={330} y={FEET} h={HH} expr={boom ? 'nervous' : 'smile'} arms={boom ? ['up', 'up'] : ['down', 'down']} extra={<ColanderHat />} />
      <Character who="ines" x={880} y={FEET + 40} h={760} expr={f > d * 0.75 ? 'smug' : 'annoyed'} flip talking={!boom} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d="M330,480 Q560,420 600,1090" fill="none" stroke="#E8505B" strokeWidth={9} />
      </svg>
      <Toaster x={600} y={1090} w={220} boom={boom} />
      {!boom && <Bubble x={720} y={330} w={500} text="Elle avait quel âge ? 🤨" side="R" size={52} />}
      {f > d * 0.75 && <Pill x={540} y={330} text="… 6 ans 😬" bg="#FFD84A" size={80} rotate={-4} />}
    </AbsoluteFill>
  );
};

const Cta: React.FC<P> = () => (
  <AbsoluteFill>
    <Sunburst />
    <Phone x={540} y={130} w={460}>
      <div style={{position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, color: OL}}>
        <div style={{fontSize: 46}}>C'est quoi ton nombre ?</div>
        <div style={{fontSize: 210, lineHeight: 1.2}}>🤫</div>
        <div style={{fontSize: 42, color: '#E8505B'}}>Ne pas répondre</div>
      </div>
    </Phone>
    <Character who="ines" x={210} y={FEET + 40} h={800} expr="smug" delay={4} />
    <Character who="theo" x={870} y={FEET + 40} h={820} expr="nervous" flip delay={8} extra={<ColanderHat />} />
  </AbsoluteFill>
);

export const SCENES_V2: Record<string, React.FC<P>> = {
  hook: Hook,
  couple: Couple,
  ines: Ines,
  theo: Theo,
  lab: LabScene,
  cond1: Cond1,
  cond2: Cond2,
  cond3: Cond3,
  result: Result,
  result2: Result2,
  men: Men,
  reason: Reason,
  round: Round,
  twist: Twist,
  twist2: Twist2,
  cta: Cta,
  outro: Outro,
};
