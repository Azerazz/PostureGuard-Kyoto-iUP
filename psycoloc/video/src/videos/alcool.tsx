import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Bar, Lab, Room, Sunburst, Vignette} from '../components/Backgrounds';
import {Character} from '../components/Character';
import {Brain, Bubble, Phone, Pill, Sparkle, usePop} from '../components/Props';
import {BG, FONT_TITLE, OL} from '../theme';
import {Outro} from './v1';

type P = {d: number};

const FEET = 1460;
const HH = 900;

/* ---------- accessoires ---------- */

/** Verre à cocktail menthe (+ feuille), ou verre d'eau. */
const Glass: React.FC<{x: number; y: number; w: number; color?: string; label?: string; delay?: number; tilt?: number}> = ({x, y, w, color = '#9BE3B8', label, delay = 0, tilt = 0}) => {
  const f = useCurrentFrame();
  const p = usePop(delay);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: `scale(${p}) rotate(${tilt + Math.sin(f / 9) * 3}deg)`}}>
      <svg viewBox="0 0 100 150" width={w} height={w * 1.5} style={{overflow: 'visible'}}>
        <path d="M14,10 L86,10 L76,130 Q75,140 65,140 L35,140 Q25,140 24,130 Z" fill="#EAF7FF" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <path d="M19,40 L81,40 L76,128 Q75,136 66,136 L34,136 Q25,136 24,128 Z" fill={color} opacity={0.9} />
        <circle cx={40} cy={70} r={5} fill="#fff" opacity={0.7} />
        <circle cx={60} cy={95} r={4} fill="#fff" opacity={0.7} />
        <path d="M60,-10 L50,60" stroke="#E8505B" strokeWidth={6} strokeLinecap="round" />
        <path d="M24,22 Q38,0 52,18 Q38,30 24,22Z" fill="#3FB394" stroke={OL} strokeWidth={4} />
      </svg>
      {label && (
        <div style={{textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: w * 0.24, color: OL, marginTop: 8, whiteSpace: 'nowrap'}}>{label}</div>
      )}
    </div>
  );
};

/** Éthylotest avec écran. */
const Breathalyzer: React.FC<{x: number; y: number; w: number; value: string}> = ({x, y, w, value}) => {
  const p = usePop(4);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: `scale(${p}) rotate(-8deg)`}}>
      <div style={{width: w * 0.22, height: w * 0.3, margin: '0 auto', background: '#fff', border: `7px solid ${OL}`, borderRadius: '14px 14px 0 0', borderBottom: 'none'}} />
      <div style={{background: '#4E7FE0', border: `8px solid ${OL}`, borderRadius: 36, padding: w * 0.08}}>
        <div style={{background: '#CFF5D8', border: `6px solid ${OL}`, borderRadius: 14, textAlign: 'center', fontFamily: "'DejaVu Sans Mono', monospace", fontWeight: 700, fontSize: w * 0.2, color: OL, padding: '10px 0'}}>{value}</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 18, marginTop: 18}}>
          {['#E8505B', '#F6C445', '#3FB394'].map((c) => (
            <div key={c} style={{width: w * 0.12, height: w * 0.12, borderRadius: '50%', background: c, border: `5px solid ${OL}`}} />
          ))}
        </div>
      </div>
    </div>
  );
};

/** Miroir sur pied : reflet « beau gosse ». */
const Mirror: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w}}>
      <div style={{height: w * 1.35, background: 'linear-gradient(135deg,#DDF3FF,#9FD4F5)', border: `12px solid #C9935F`, outline: `6px solid ${OL}`, borderRadius: '50% 50% 18px 18px', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: '15%', top: '10%', width: '18%', height: '70%', background: '#fff', opacity: 0.45, transform: 'skewX(-12deg)'}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: w * 0.42, transform: `scale(${1 + Math.sin(f / 5) * 0.06})`}}>😎</div>
      </div>
      <div style={{width: 14, height: w * 0.4, background: OL, margin: '0 auto'}} />
    </div>
  );
};

/** Carton de note brandi par un juge. */
const Score: React.FC<{x: number; y: number; v: string; delay?: number}> = ({x, y, v, delay = 0}) => {
  const p = usePop(delay);
  return (
    <div style={{position: 'absolute', left: x - 80, top: y, width: 160, transform: `scale(${p})`}}>
      <div style={{background: '#fff', border: `7px solid ${OL}`, borderRadius: 18, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 84, color: OL}}>{v}</div>
      <div style={{width: 14, height: 90, background: '#C9935F', border: `4px solid ${OL}`, margin: '0 auto'}} />
    </div>
  );
};

const AlcoholWarning: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1580, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: 'rgba(30,42,44,0.8)', borderRadius: 18, padding: '10px 26px', fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 40, color: '#fff'}}>L'abus d'alcool est dangereux pour la santé</div>
  </div>
);

/* ---------- scènes ---------- */

const Hook: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sunburst />
      <Pill x={540} y={200} text="🏆 Prix Ig Nobel 2013" bg="#F6C445" size={62} delay={2} />
      <Pill x={540} y={330} text="🇫🇷 Chercheurs de Grenoble" bg="#fff" size={48} delay={8} />
      <Character who="malik" x={420} y={FEET} h={HH} expr={f > d * 0.6 ? 'wow' : 'smug'} arms={['down', 'hold']} />
      <Glass x={560} y={1010} w={130} delay={4} />
      <Mirror x={880} y={620} w={260} />
      <Sparkle x={300} y={620} size={70} delay={10} />
      {f > d * 0.6 && <Pill x={540} y={480} text="0 % alcool 🤯" bg="#F0646A" color="#fff" size={56} />}
    </AbsoluteFill>
  );
};

const Setup: React.FC<P> = () => (
  <AbsoluteFill>
    <Bar />
    <Character who="malik" x={420} y={FEET} h={HH} expr="smug" arms={['down', 'hold']} />
    <Glass x={560} y={1010} w={120} />
    {[0, 1, 2].map((i) => (
      <Glass key={i} x={760 + i * 110} y={1240} w={90} delay={6 + i * 6} color="#F6C445" tilt={-6 + i * 6} />
    ))}
    <Pill x={420} y={520} text="Charisme : 1000 % 😎" bg="#fff" size={52} delay={10} />
    <Sparkle x={250} y={680} size={70} delay={4} />
    <Sparkle x={600} y={640} size={55} delay={12} />
  </AbsoluteFill>
);

const Drague: React.FC<P> = () => (
  <AbsoluteFill>
    <Bar />
    <Character who="friend" x={860} y={FEET} h={980} expr="annoyed" arms={['cross', 'cross']} flip />
    <Character who="malik" x={360} y={FEET} h={HH} expr="happy" arms={['point', 'up']} talking />
    <Pill x={860} y={420} text="VIDEUR" bg={OL} color="#fff" size={46} />
    <Pill x={360} y={460} text="🤖 danse du robot" bg="#fff" size={50} delay={8} rotate={-5} />
  </AbsoluteFill>
);

const JadeScene: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Bar />
      <Character who="jade" x={420} y={FEET} h={HH} expr="smug" arms={['hold', 'hold']} />
      <div style={{position: 'absolute', left: 400, top: 900}}>
        <div style={{width: 150, height: 240, background: OL, borderRadius: 26, padding: 10, transform: 'rotate(-6deg)'}}>
          <div style={{width: '100%', height: '100%', background: '#8FB5D6', borderRadius: 18}} />
        </div>
      </div>
      <Pill x={420} y={560} text={`${Math.floor(f / 8) % 2 ? '🔴' : '⚪'} REC`} bg="#fff" size={56} />
      <Pill x={800} y={720} text="🔬 pour la science" bg="#F6C445" size={46} delay={6} rotate={6} />
    </AbsoluteFill>
  );
};

const BarStudy: React.FC<P> = () => (
  <AbsoluteFill>
    <Bar />
    <Pill x={540} y={160} text="🍺 Bar de Grenoble · 19 clients" bg="#fff" size={50} />
    <Character who="studentA" x={330} y={FEET} h={HH} expr="nervous" />
    <Breathalyzer x={760} y={420} w={300} value="0,8 g/L" />
    <Sparkle x={560} y={720} size={60} delay={8} />
  </AbsoluteFill>
);

const Barres: React.FC<P> = () => {
  const f = useCurrentFrame();
  const levels = [
    {l: 'sobre', v: 0.3, e: '🙂'},
    {l: 'pompette', v: 0.55, e: '😏'},
    {l: 'bourré', v: 0.85, e: '😎'},
  ];
  return (
    <AbsoluteFill>
      <Vignette color="#DCD3FB" disc="#EEE9FF" y={700} />
      <Pill x={540} y={190} text="« Je me trouve beau »" bg="#fff" size={54} />
      <div style={{position: 'absolute', left: 80, top: 1106, width: 920, height: 10, background: OL, borderRadius: 6}} />
      {levels.map((lv, i) => {
        const h = interpolate(f, [2 + i * 6, 20 + i * 6], [0, lv.v * 700], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const x = 230 + i * 310;
        return (
          <React.Fragment key={lv.l}>
            <div style={{position: 'absolute', left: x - 115, top: 1110 - h, width: 230, height: h, background: ['#93B6EE', '#F6C445', '#F0646A'][i], border: `8px solid ${OL}`, borderRadius: '24px 24px 0 0'}} />
            <div style={{position: 'absolute', left: x - 60, top: 1110 - h - 120, fontSize: 100, opacity: h > 40 ? 1 : 0}}>{lv.e}</div>
            <div style={{position: 'absolute', left: x - 150, top: 1130, width: 300, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 50, color: OL}}>{lv.l}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const LabScene: React.FC<P> = () => (
  <AbsoluteFill>
    <Lab
      board={
        <div style={{fontFamily: FONT_TITLE, color: '#fff', padding: '34px 44px'}}>
          <div style={{fontSize: 110, fontWeight: 700, lineHeight: 1}}>86 hommes</div>
          <div style={{fontSize: 50, fontWeight: 600, marginTop: 24}}>cocktail menthe 🍹</div>
        </div>
      }
    />
    <Character who="prof" x={820} y={FEET} h={HH} expr="happy" arms={['hold', 'down']} flip />
    <Glass x={690} y={1000} w={110} delay={8} />
    <Character who="studentA" x={220} y={FEET + 30} h={720} expr="smile" delay={6} />
  </AbsoluteFill>
);

const Lab2: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Vignette color="#B9E0CF" disc="#DDF2E8" y={760} />
      <Glass x={300} y={330} w={230} label="5-6 shots 🍸" />
      <Glass x={780} y={330} w={230} label="0 alcool 💧" color="#CDEBFF" delay={6} />
      <div style={{position: 'absolute', left: 540 - 40, top: 520, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 110, color: OL}}>VS</div>
      {f > d * 0.55 && <Pill x={540} y={1050} text="🤥 On ment à la moitié !" bg="#F0646A" color="#fff" size={60} rotate={-3} />}
    </AbsoluteFill>
  );
};

const Lab3: React.FC<P> = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Lab
        board={
          <div style={{fontFamily: FONT_TITLE, color: '#fff', padding: '40px 44px', fontSize: 72, fontWeight: 700}}>
            🎬 Tourne une pub !<div style={{fontSize: 50, fontWeight: 600, marginTop: 20}}>puis note ta beauté /10</div>
          </div>
        }
      />
      <Character who="studentA" x={420} y={FEET} h={HH} expr="happy" arms={['up', 'hold']} talking />
      <Glass x={560} y={980} w={110} />
      <Pill x={880} y={560} text={`${Math.floor(f / 8) % 2 ? '🔴' : '⚪'} REC`} bg="#fff" size={54} />
    </AbsoluteFill>
  );
};

const Result: React.FC<P> = () => (
  <AbsoluteFill>
    <Room wall={BG.blueWall} stripe={BG.blueWall2} window={false} />
    <Mirror x={790} y={420} w={300} />
    <Character who="studentA" x={360} y={FEET} h={HH} expr="love" arms={['down', 'wave']} />
    <Glass x={520} y={1020} w={110} color="#CDEBFF" />
    <Pill x={360} y={420} text="« Je suis un 10/10 »" bg="#fff" size={50} delay={4} />
    <Pill x={790} y={1120} text="verre SANS alcool 🤫" bg="#F6C445" size={44} delay={14} rotate={4} />
  </AbsoluteFill>
);

const Judges: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Vignette color="#F7C3D6" disc="#FBE1EB" y={760} />
      <Pill x={540} y={170} text="👀 22 étudiants jugent les vidéos" bg="#fff" size={48} />
      <Character who="studentB" x={230} y={FEET} h={760} expr="annoyed" arms={['up', 'down']} />
      <Character who="friend" x={540} y={FEET} h={780} expr="annoyed" arms={['up', 'down']} delay={4} />
      <Character who="author" x={850} y={FEET} h={760} expr="annoyed" arms={['up', 'down']} flip delay={8} />
      <Score x={150} y={420} v="5" delay={6} />
      <Score x={460} y={400} v="5" delay={10} />
      <Score x={930} y={420} v="5" delay={14} />
      {f > d * 0.4 && <Pill x={540} y={300} text="= aucune différence" bg="#F6C445" size={56} />}
    </AbsoluteFill>
  );
};

const Reason: React.FC<P> = () => (
  <AbsoluteFill>
    <Vignette color={BG.pinkWall} disc="#FBE1EB" y={700} />
    <Brain x={540} y={660} size={720} expr="smug" />
    <Pill x={540} y={1440} text="🍹 « j'ai bu » ➜ 😎 confiance" bg="#fff" size={52} delay={6} />
    <Pill x={540} y={180} text="EFFET PLACEBO" bg="#F0646A" color="#fff" size={64} />
  </AbsoluteFill>
);

const Twist: React.FC<P> = () => (
  <AbsoluteFill>
    <Room wall={BG.peachWall} stripe={BG.peachWall2} window="left" curtain="#4E7FE0" couch="#C49BF2" />
    <Character who="malik" x={330} y={FEET} h={HH} expr="sad" arms={['chin', 'down']} />
    <Character who="jade" x={790} y={FEET} h={HH} expr="smug" arms={['down', 'hold']} flip />
    <Pill x={330} y={520} text="🤕 lendemain" bg="#fff" size={50} />
    <Bubble x={760} y={380} w={420} text="Regarde ça 😏" side="R" size={54} />
  </AbsoluteFill>
);

const Twist2: React.FC<P> = () => {
  const f = useCurrentFrame();
  const carry = interpolate(f, [0, 80], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Sunburst a="#3A2A4A" b="#4A3660" speed={0.2} />
      <Phone x={540} y={140} w={640}>
        <div style={{position: 'absolute', inset: 0, background: '#3A2A4A', overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${interpolate(carry, [0, 1], [-40, 160])}px)`}}>
            <Character who="friend" x={290} y={1120} h={700} expr="annoyed" arms={['up', 'up']} delay={-30} />
            <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: `rotate(${-84 + Math.sin(f / 4) * 4}deg)`, transformOrigin: '290px 470px'}}>
              <Character who="malik" x={290} y={760} h={560} expr="happy" arms={['wave', 'wave']} delay={-30} />
            </div>
          </div>
          <div style={{position: 'absolute', left: 30, top: 70, fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 40, color: '#fff'}}>🔴 00:0{Math.min(9, Math.floor(f / 30))}</div>
        </div>
      </Phone>
      <Pill x={540} y={1430} text="🥔 sac de patates" bg="#F6C445" size={56} delay={30} rotate={-4} />
    </AbsoluteFill>
  );
};

const Cta: React.FC<P> = () => (
  <AbsoluteFill>
    <Sunburst />
    <Mirror x={540} y={160} w={300} />
    <Character who="malik" x={300} y={FEET} h={HH} expr="smug" arms={['down', 'hold']} />
    <Glass x={440} y={1010} w={110} />
    <Character who="jade" x={800} y={FEET} h={HH} expr="annoyed" arms={['cross', 'cross']} flip />
    <Pill x={540} y={760} text="🧠 ton cerveau te ment" bg="#fff" size={50} delay={10} />
    <AlcoholWarning />
  </AbsoluteFill>
);

export const SCENES_ALCOOL: Record<string, React.FC<P>> = {
  hook: Hook,
  setup: Setup,
  drague: Drague,
  jade: JadeScene,
  bar: BarStudy,
  barres: Barres,
  lab: LabScene,
  lab2: Lab2,
  lab3: Lab3,
  result: Result,
  judges: Judges,
  reason: Reason,
  twist: Twist,
  twist2: Twist2,
  cta: Cta,
  outro: Outro,
};
