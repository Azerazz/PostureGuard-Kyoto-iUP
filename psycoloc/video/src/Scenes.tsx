import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bar, Lab, Room, Spotlight, Sunburst, Tablecloth, Vignette} from './components/Backgrounds';
import {Character} from './components/Character';
import {LogoMark, Wordmark} from './components/Logo';
import {
  BigText,
  Brain,
  Bubble,
  Card,
  Clock,
  Confetti,
  FloatingHearts,
  Heart,
  Meter,
  Mug,
  Newspaper,
  Phone,
  Pill,
  Rings,
  Sparkle,
  Warning,
  usePop,
} from './components/Props';
import {BG, C, FONT_TITLE, OL} from './theme';

type P = {d: number};

const FEET = 1460; // pieds des personnages (le sol commence à 1180)
const HH = 900; // taille standard d'un personnage
const TABLE_FEET = 1550;

const Sock: React.FC<{x: number; y: number; r?: number; color?: string}> = ({x, y, r = 0, color = '#fff'}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${r}deg)`}}>
      <svg width={150} height={150} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
        <path d="M30,6 L58,6 L58,58 Q58,70 70,74 L84,78 Q96,82 92,92 Q88,100 74,96 L36,86 Q26,82 28,70 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <path d="M30,18 L58,18" stroke="#E8505B" strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${20 + i * 22},-6 q-8,-10 0,-20 q8,-10 0,-20`} fill="none" stroke="#7BBF6A" strokeWidth={4} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 5 + i)} />
        ))}
      </svg>
    </div>
  );
};

const Hook: React.FC<P> = ({d}) => (
  <AbsoluteFill>
    <Sunburst />
    <BigText x={540} y={230} text="36" size={300} delay={4} />
    <Pill x={540} y={440} text="QUESTIONS" delay={10} size={64} bg="#F6C445" />
    <Character who="malik" x={320} y={FEET} h={HH} expr="smile" arms={['down', 'wave']} look={7} />
    <Character who="jade" x={770} y={FEET} h={HH} expr="smile" flip look={7} delay={4} />
    <Heart x={545} y={600} size={140} delay={Math.round(d * 0.35)} />
    <Sparkle x={420} y={560} size={60} delay={Math.round(d * 0.4)} />
    <Sparkle x={680} y={540} size={50} delay={Math.round(d * 0.45)} />
  </AbsoluteFill>
);

const Malik: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Room wall={BG.mintWall} stripe={BG.mintWall2} curtain="#F28FB0" frame={<div style={{fontSize: 90, textAlign: 'center', lineHeight: '150px'}}>🌻</div>} />
      <Character who="malik" x={330} y={FEET} h={HH} expr={f > d * 0.5 ? 'nervous' : 'happy'} arms={['down', 'chin']} talking={f > d * 0.5} />
      <Character who="jade" x={790} y={FEET} h={HH} expr="annoyed" flip look={-6} />
      {f < d * 0.5 ? (
        <>
          <Heart x={230} y={560} size={90} delay={3} />
          <Heart x={380} y={510} size={70} delay={8} />
        </>
      ) : (
        <Bubble x={330} y={330} w={430} text="Il fait beau, hein ? ☀️" side="L" />
      )}
    </AbsoluteFill>
  );
};

const JadeScene: React.FC<P> = () => (
  <AbsoluteFill>
    <Room wall={BG.peachWall} stripe={BG.peachWall2} window="left" curtain="#4E7FE0" couch="#C49BF2" />
    <Character who="jade" x={360} y={FEET} h={HH} expr="annoyed" arms={['hip', 'point']} look={10} />
    <Sock x={640} y={1290} r={-15} />
    <Sock x={820} y={1330} r={20} color="#F6C445" />
    <Pill x={790} y={1130} text="🤢" bg="#fff" size={70} delay={8} />
  </AbsoluteFill>
);

const LabScene: React.FC<P> = () => (
  <AbsoluteFill>
    <Lab
      board={
        <div style={{fontFamily: FONT_TITLE, color: '#fff', padding: '34px 44px'}}>
          <div style={{fontSize: 140, fontWeight: 700, lineHeight: 1}}>1997</div>
          <div style={{fontSize: 58, fontWeight: 600, marginTop: 20}}>2 inconnus · 45 min ⏱️</div>
        </div>
      }
    />
    <Character who="prof" x={800} y={FEET} h={HH} expr="smile" arms={['point', 'down']} flip />
    <Character who="studentA" x={160} y={FEET + 30} h={720} expr="nervous" delay={10} look={8} />
    <Character who="studentB" x={420} y={FEET + 30} h={720} expr="wow" delay={22} flip look={8} />
    <Pill x={160} y={760} text="?" bg="#fff" delay={18} />
    <Pill x={420} y={760} text="?" bg="#fff" delay={30} />
  </AbsoluteFill>
);

const Cards: React.FC<P> = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nums = ['1', '4', '9', '13', '18', '24', '29', '33', '36'];
  return (
    <AbsoluteFill>
      <Vignette color={BG.pinkWall} disc="#FBE1EB" y={760} />
      {nums.map((n, i) => {
        const p = spring({frame: f - i * 2, fps, config: {damping: 12}});
        const rot = interpolate(p, [0, 1], [0, -48 + i * 12]);
        const color = ['#D6E7FF', '#D5F5E8', '#FFE9A8', '#FFE1B8', '#FFD3E2', '#FF9EC0', '#FF8FA8', '#F0646A', '#F0646A'][i];
        return (
          <div
            key={n}
            style={{
              position: 'absolute',
              left: 540 - 130,
              top: 470,
              width: 260,
              height: 370,
              background: color,
              border: `8px solid ${OL}`,
              borderRadius: 30,
              transform: `rotate(${rot}deg)`,
              transformOrigin: '50% 140%',
              fontFamily: FONT_TITLE,
              fontWeight: 700,
              fontSize: 110,
              color: i > 6 ? '#fff' : OL,
              WebkitTextStroke: i > 6 ? `5px ${OL}` : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {n}
          </div>
        );
      })}
      <Meter x={540} y={1450} w={780} value={0.95} delay={8} />
    </AbsoluteFill>
  );
};

const TableScene: React.FC<{wall: string; stripe: string; night?: boolean; card: React.ReactNode; m: React.ComponentProps<typeof Character>['expr']; j: React.ComponentProps<typeof Character>['expr']; talkM?: boolean; talkJ?: boolean}> = ({
  wall,
  stripe,
  night,
  card,
  m,
  j,
  talkM,
  talkJ,
}) => (
  <AbsoluteFill>
    <Room wall={wall} stripe={stripe} night={night} window={false} />
    {card}
    <Character who="malik" x={310} y={TABLE_FEET} h={HH} expr={m} arms={['hold', 'hold']} talking={talkM} delay={-30} />
    <Character who="jade" x={780} y={TABLE_FEET} h={HH} expr={j} arms={['hold', 'hold']} talking={talkJ} flip delay={-30} />
    <Mug x={545} y={1140} size={110} />
    <Tablecloth />
  </AbsoluteFill>
);

const Q1: React.FC<P> = () => (
  <TableScene
    wall={BG.blueWall}
    stripe={BG.blueWall2}
    m="happy"
    j="smile"
    talkM
    card={<Card x={540} y={180} w={880} label="QUESTION 1 · 🧊" labelColor="#4E7FE0" text="Avec qui aimerais-tu dîner, si tu pouvais choisir n'importe qui ?" fontSize={60} />}
  />
);

const Q2: React.FC<P> = () => (
  <TableScene
    wall={BG.nightWall}
    stripe={BG.nightWall2}
    m="wow"
    j="sad"
    talkJ={false}
    card={<Card x={540} y={180} w={880} label="QUESTION 30 · 🔥" labelColor="#F0646A" text="Quand as-tu pleuré devant quelqu'un pour la dernière fois ?" fontSize={60} color="#FFF0F4" shake={5} />}
  />
);

const Result: React.FC<P> = () => {
  const f = useCurrentFrame();
  const g1 = interpolate(f, [3, 20], [0, 220], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const g2 = interpolate(f, [10, 40], [0, 700], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bar = (x: number, h: number, color: string, label: string) => (
    <>
      <div style={{position: 'absolute', left: x - 130, top: 1150 - h, width: 260, height: h, background: color, border: `8px solid ${OL}`, borderRadius: '28px 28px 0 0'}} />
      <div style={{position: 'absolute', left: x - 220, top: 1170, width: 440, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 50, color: OL}}>{label}</div>
    </>
  );
  return (
    <AbsoluteFill>
      <Vignette color="#DCD3FB" disc="#EEE9FF" y={760} />
      <Pill x={540} y={220} text="Sentiment de proximité" bg="#fff" size={56} />
      <div style={{position: 'absolute', left: 90, top: 1146, width: 900, height: 10, background: OL, borderRadius: 6}} />
      {bar(320, g1, '#93B6EE', 'Small talk 🌦️')}
      {bar(760, g2, '#F0646A', '36 questions')}
      <Heart x={760} y={1150 - g2 - 85} size={140} delay={38} />
    </AbsoluteFill>
  );
};

const Married: React.FC<P> = () => (
  <AbsoluteFill>
    <Sunburst a="#FBD7A6" b="#FDE9C8" />
    <Rings x={540} y={330} size={380} />
    <Sparkle x={320} y={300} size={90} delay={6} color="#fff" />
    <Sparkle x={780} y={520} size={70} delay={10} color="#fff" />
    <Character who="studentA" x={340} y={FEET} h={HH} expr="love" arms={['down', 'up']} delay={2} />
    <Character who="studentB" x={740} y={FEET} h={HH} expr="love" arms={['up', 'down']} flip delay={5} />
    <Confetti seed="m" n={45} />
  </AbsoluteFill>
);

const Nyt: React.FC<P> = () => (
  <AbsoluteFill>
    <Bar />
    <Newspaper x={540} y={130} w={820} delay={2} />
    <Character who="author" x={320} y={FEET} h={HH} expr="smile" talking delay={4} />
    <Character who="friend" x={780} y={FEET} h={HH} expr="smile" flip delay={8} />
  </AbsoluteFill>
);

const Love: React.FC<P> = () => {
  const f = useCurrentFrame();
  const s = 1 + Math.max(0, Math.sin(f / 4)) * 0.06;
  return (
    <AbsoluteFill>
      <Vignette color="#F7A8BE" disc="#FBD0DC" y={700} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`}}>
        <Heart x={540} y={520} size={640} beat={false} />
      </div>
      <Character who="author" x={380} y={FEET} h={HH} expr="love" arms={['down', 'up']} />
      <Character who="friend" x={710} y={FEET} h={HH} expr="love" arms={['up', 'down']} flip />
      <FloatingHearts n={10} seed="lv" area={[60, 150, 1000, 1200]} />
    </AbsoluteFill>
  );
};

const Secret: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  const steps = Math.min(4, Math.floor(f / (d / 5)) + 1);
  const face = (x: number, col: string) => (
    <div style={{position: 'absolute', left: x, top: 220, width: 110, height: 110, borderRadius: '50%', background: col, border: `6px solid #fff`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60}}>🙂</div>
  );
  return (
    <AbsoluteFill>
      <Lab
        board={
          <div style={{position: 'relative', width: '100%', height: '100%'}}>
            {face(40, '#F7C3D6')}
            {face(470, '#FBD7A6')}
            {Array.from({length: steps}).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: i % 2 ? 300 : 170,
                  top: 230 - i * 52,
                  width: 150,
                  height: 40,
                  borderRadius: 20,
                  border: '5px solid #fff',
                  background: i === 3 ? '#F0646A' : 'transparent',
                }}
              />
            ))}
            <div style={{position: 'absolute', left: 30, bottom: 26, fontFamily: FONT_TITLE, fontSize: 46, color: '#fff', fontWeight: 600}}>chacun son tour → 💗</div>
          </div>
        }
      />
      <Character who="prof" x={830} y={FEET} h={HH} expr="happy" arms={['point', 'down']} flip talking />
      <Character who="malik" x={220} y={FEET + 30} h={700} expr="smile" delay={6} />
    </AbsoluteFill>
  );
};

const BrainScene: React.FC<P> = () => (
  <AbsoluteFill>
    <Vignette color={BG.pinkWall} disc="#FBE1EB" y={720} />
    <FloatingHearts n={12} seed="b" area={[60, 150, 1000, 1150]} />
    <Brain x={540} y={700} size={780} expr="love" />
    <Pill x={540} y={1430} text="confiance = intimité" bg="#fff" delay={10} size={60} />
  </AbsoluteFill>
);

const Twist: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  const late = f > d * 0.3;
  return (
    <AbsoluteFill>
      <Room wall={BG.nightWall} stripe={BG.nightWall2} night couch="#F0646A" lamp window="right" curtain="#F6C445" />
      <div style={{position: 'absolute', left: 120, top: 110}}>
        <Clock x={110} y={110} size={220} speed={late ? 10 : 1} />
      </div>
      {late && <Bubble x={330} y={380} w={560} text="…et en CM2, personne n'est venu à mon anniv 😭" size={48} />}
      <Character who="malik" x={320} y={FEET} h={HH} expr={late ? 'sad' : 'smug'} arms={late ? ['up', 'wave'] : ['hold', 'hold']} talking={late} />
      {!late && <Card x={320} y={1120} w={220} text="1 → 36" fontSize={52} color="#F6C445" rotate={-6} />}
      <Character who="jade" x={790} y={FEET} h={HH} expr="smug" arms={['down', 'hold']} flip />
      <Mug x={720} y={1150} size={110} />
    </AbsoluteFill>
  );
};

const WarningScene: React.FC<P> = () => (
  <AbsoluteFill>
    <Sunburst a={BG.navy} b={BG.taupe} speed={0.2} />
    <Warning x={540} y={330} size={400} />
    <Character who="malik" x={310} y={FEET} h={HH} expr="nervous" arms={['down', 'point']} />
    <Character who="jade" x={790} y={FEET} h={HH} expr="annoyed" arms={['cross', 'cross']} flip />
  </AbsoluteFill>
);

const Cta: React.FC<P> = () => {
  const f = useCurrentFrame();
  const plane = interpolate(f, [40, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Sunburst />
      <Spotlight x={540} w={700} />
      <Phone x={540} y={130} w={460} delay={0}>
        <div style={{position: 'absolute', top: 100, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, color: OL}}>
          <div style={{fontSize: 40, opacity: 0.7}}>QUESTION</div>
          <div style={{fontSize: 220, lineHeight: 1, color: '#F0646A', WebkitTextStroke: `9px ${OL}`, paintOrder: 'stroke fill'}}>36</div>
          <div style={{fontSize: 38, padding: '0 30px'}}>À qui tu la poserais ?</div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: `translateX(-50%) scale(${1 + Math.max(0, Math.sin(f / 4)) * 0.12})`,
            background: '#F0646A',
            color: '#fff',
            border: `7px solid ${OL}`,
            borderRadius: 999,
            padding: '14px 40px',
            fontFamily: FONT_TITLE,
            fontWeight: 700,
            fontSize: 46,
            whiteSpace: 'nowrap',
          }}
        >
          Envoyer 💌
        </div>
      </Phone>
      <div style={{position: 'absolute', left: interpolate(plane, [0, 1], [700, 1150]), top: interpolate(plane, [0, 1], [700, 200]), fontSize: 130, transform: 'rotate(-20deg)'}}>💌</div>
      <Character who="ines" x={200} y={FEET + 40} h={800} expr="wow" arms={['up', 'down']} delay={4} />
      <Character who="theo" x={880} y={FEET + 40} h={820} expr="happy" arms={['down', 'up']} flip delay={8} />
    </AbsoluteFill>
  );
};

const Outro: React.FC<P> = () => {
  const p = usePop(6);
  const f = useCurrentFrame();
  const sub = usePop(14);
  return (
    <AbsoluteFill>
      <Sunburst />
      <div style={{position: 'absolute', left: 540 - 200, top: 90, transform: `scale(${usePop(0, 9)})`}}>
        <LogoMark size={400} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', transform: `scale(${p})`}}>
        <Wordmark size={140} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 760,
          transform: `translate(-50%,-50%) scale(${sub * (1 + Math.max(0, Math.sin(f / 4)) * 0.08)})`,
          background: '#FE2C55',
          color: '#fff',
          border: `7px solid ${OL}`,
          borderRadius: 28,
          padding: '12px 46px',
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          fontSize: 58,
        }}
      >
        + Abonne-toi
      </div>
      <Character who="ines" x={150} y={FEET + 60} h={620} expr="happy" arms={['wave', 'down']} delay={2} />
      <Character who="malik" x={400} y={FEET + 60} h={640} expr="wink" arms={['down', 'wave']} delay={5} />
      <Character who="jade" x={660} y={FEET + 60} h={620} expr="smile" arms={['wave', 'down']} delay={8} flip />
      <Character who="theo" x={910} y={FEET + 60} h={660} expr="happy" arms={['down', 'wave']} delay={11} flip />
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC<P>> = {
  hook: Hook,
  malik: Malik,
  jade: JadeScene,
  lab: LabScene,
  cards: Cards,
  q1: Q1,
  q2: Q2,
  result: Result,
  married: Married,
  nyt: Nyt,
  love: Love,
  secret: Secret,
  brain: BrainScene,
  twist: Twist,
  warning: WarningScene,
  cta: Cta,
  outro: Outro,
};

/** Coupes franches comme dans la référence, avec un très léger zoom lent. */
export const SceneWrap: React.FC<{d: number; children: React.ReactNode}> = ({d, children}) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, d], [1, 1.025]);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 50%'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

