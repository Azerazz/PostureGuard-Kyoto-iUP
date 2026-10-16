import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bar, Lab, Pastel, Room, Sunburst} from './components/Backgrounds';
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
import {C, FONT_TITLE, OL} from './theme';

type P = {d: number};

const FEET = 1660;

const Hook: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  const mx = interpolate(f, [0, d], [190, 360], {extrapolateRight: 'clamp'});
  const jx = interpolate(f, [0, d], [890, 720], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Sunburst a={C.pink} b={C.pinkLight} />
      <BigText x={540} y={480} text="36" size={500} />
      <Pill x={540} y={790} text="QUESTIONS 💘" delay={8} size={76} />
      <Pill x={300} y={250} text="45 min ⏱️" bg="#fff" delay={60} size={54} rotate={-8} />
      <Character who="malik" x={mx} y={FEET} h={640} expr="smile" look={6} />
      <Character who="jade" x={jx} y={FEET} h={640} expr="smile" flip look={6} />
      <Heart x={540} y={1060} size={150} delay={Math.round(d * 0.6)} />
    </AbsoluteFill>
  );
};

const Malik: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  const wink = f > d * 0.45;
  return (
    <AbsoluteFill>
      <Room wall={C.mintLight} stripe="#C5EEDD" couch={C.purple} frame />
      <Character
        who="malik"
        x={300}
        y={FEET}
        h={700}
        expr={wink ? 'wink' : 'smug'}
        arms={['hold', 'hold']}
      />
      <Card x={300} y={1370} w={240} text="36?" fontSize={64} color={C.yellow} rotate={-6} delay={4} />
      <Character who="jade" x={790} y={FEET} h={680} expr="smile" arms={['hold', 'hold']} flip look={-4} />
      <div style={{position: 'absolute', left: 715, top: 1400, width: 160, height: 110, background: C.blue, border: `8px solid ${OL}`, borderRadius: 10, transform: 'rotate(4deg)'}} />
      {wink && <Sparkle x={400} y={1000} size={110} />}
      <Bubble x={250} y={700} w={330} text="hé hé 😏" delay={10} />
    </AbsoluteFill>
  );
};

const LabScene: React.FC<P> = () => (
  <AbsoluteFill>
    <Lab
      board={
        <div style={{fontFamily: FONT_TITLE, color: '#fff', padding: 40}}>
          <div style={{fontSize: 130, fontWeight: 700}}>1997</div>
          <div style={{fontSize: 52, fontWeight: 600, opacity: 0.9}}>Expérience : la proximité</div>
          <svg width={520} height={90} viewBox="0 0 520 90">
            <path d="M10,70 Q130,10 250,50 T510,20" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          </svg>
        </div>
      }
    />
    <Character who="prof" x={830} y={FEET} h={720} expr="happy" arms={['point', 'down']} flip />
    <Character who="studentA" x={170} y={FEET + 40} h={500} expr="nervous" delay={12} look={8} />
    <Character who="studentB" x={430} y={FEET + 40} h={500} expr="smile" delay={30} flip look={8} />
    <Pill x={170} y={1080} text="?" bg="#fff" delay={20} />
    <Pill x={430} y={1080} text="?" bg="#fff" delay={38} />
  </AbsoluteFill>
);

const Cards: React.FC<P> = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nums = ['1', '4', '9', '13', '18', '24', '29', '33', '36'];
  return (
    <AbsoluteFill>
      <Pastel color={C.cream} dot="#F6E3BE" />
      {nums.map((n, i) => {
        const p = spring({frame: f - i * 3, fps, config: {damping: 12}});
        const rot = interpolate(p, [0, 1], [0, -48 + i * 12]);
        const color = [C.blueLight, C.mintLight, C.yellow, '#FFE1B8', C.pinkLight, C.pink, '#FF8FA8', C.coral, C.coral][i];
        return (
          <div
            key={n}
            style={{
              position: 'absolute',
              left: 540 - 140,
              top: 420,
              width: 280,
              height: 400,
              background: color,
              border: `9px solid ${OL}`,
              borderRadius: 34,
              boxShadow: `0 12px 0 ${OL}`,
              transform: `rotate(${rot}deg)`,
              transformOrigin: '50% 140%',
              fontFamily: FONT_TITLE,
              fontWeight: 700,
              fontSize: 120,
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
      <Meter x={540} y={1500} w={820} value={0.95} delay={10} />
    </AbsoluteFill>
  );
};

const Q1: React.FC<P> = () => (
  <AbsoluteFill>
    <Room wall={C.blueLight} stripe="#C8DCFA" window={false} />
    <Card x={540} y={260} w={900} label="QUESTION 1" labelColor={C.blue} text="Avec qui aimerais-tu dîner, si tu pouvais choisir n'importe qui ?" fontSize={66} />
    <Meter x={540} y={880} w={700} value={0.15} delay={8} />
    <Character who="malik" x={290} y={FEET} h={600} expr="happy" arms={['down', 'wave']} talking />
    <Character who="jade" x={790} y={FEET} h={600} expr="happy" flip />
  </AbsoluteFill>
);

const Q2: React.FC<P> = () => (
  <AbsoluteFill>
    <Room wall={C.pinkLight} stripe="#FFC2D6" window={false} lamp />
    <Card x={540} y={260} w={900} label="PLUS TARD…" labelColor={C.coral} text="Quand as-tu pleuré devant quelqu'un pour la dernière fois ?" fontSize={66} color="#FFF0F4" shake={6} />
    <Meter x={540} y={900} w={700} value={0.9} delay={8} />
    <Character who="malik" x={290} y={FEET} h={600} expr="nervous" />
    <Character who="jade" x={790} y={FEET} h={600} expr="sad" flip />
  </AbsoluteFill>
);

const Result: React.FC<P> = () => {
  const f = useCurrentFrame();
  const g1 = interpolate(f, [5, 25], [0, 230], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const g2 = interpolate(f, [15, 50], [0, 720], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bar = (x: number, h: number, color: string, label: string) => (
    <>
      <div style={{position: 'absolute', left: x - 130, top: 1480 - h, width: 260, height: h, background: color, border: `9px solid ${OL}`, borderRadius: '30px 30px 0 0', boxShadow: `14px 0 0 ${OL}`}} />
      <div style={{position: 'absolute', left: x - 200, top: 1510, width: 400, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 52, color: OL}}>{label}</div>
    </>
  );
  return (
    <AbsoluteFill>
      <Pastel color={C.lavender} dot="#D3CAFF" />
      <Pill x={540} y={260} text="Sentiment de proximité" bg="#fff" size={60} />
      <div style={{position: 'absolute', left: 80, top: 1480, width: 920, height: 12, background: OL, borderRadius: 6}} />
      {bar(320, g1, C.blue, 'Petite discussion')}
      {bar(760, g2, C.coral, '36 questions')}
      <Heart x={760} y={1480 - g2 - 90} size={150} delay={45} />
    </AbsoluteFill>
  );
};

const Married: React.FC<P> = () => (
  <AbsoluteFill>
    <Sunburst a={C.yellow} b="#FFE58A" />
    <Rings x={540} y={480} size={480} />
    <Sparkle x={300} y={330} size={100} delay={8} color="#fff" />
    <Sparkle x={800} y={620} size={80} delay={14} color="#fff" />
    <Character who="studentA" x={360} y={FEET} h={640} expr="love" arms={['down', 'up']} delay={4} />
    <Character who="studentB" x={720} y={FEET} h={640} expr="love" arms={['up', 'down']} flip delay={8} />
    <Confetti seed="m" />
  </AbsoluteFill>
);

const Secret: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  const n = Math.min(5, Math.floor(f / (d / 6)) + 1);
  return (
    <AbsoluteFill>
      <Pastel color={C.mintLight} dot="#BDEBD6" />
      {Array.from({length: n}).map((_, i) => {
        const left = i % 2 === 0;
        return (
          <Bubble
            key={i}
            x={left ? 360 : 720}
            y={1020 - i * 165}
            w={420 + i * 30}
            side={left ? 'L' : 'R'}
            color={[C.white, C.yellow, C.blueLight, C.pinkLight, C.coral][i]}
            lines={0}
            size={58}
            text={['🍕 pizza', '🎮 mes jeux', '😬 mes peurs', '💭 mes rêves', '💖 mes secrets'][i]}
          />
        );
      })}
      <Character who="malik" x={220} y={FEET + 20} h={560} expr="smile" talking={n % 2 === 1} />
      <Character who="jade" x={860} y={FEET + 20} h={560} expr="smile" talking={n % 2 === 0} flip />
    </AbsoluteFill>
  );
};

const BrainScene: React.FC<P> = () => (
  <AbsoluteFill>
    <Sunburst a={C.pinkLight} b="#FFE6EE" />
    <FloatingHearts n={12} seed="b" />
    <Brain x={540} y={720} size={820} expr="love" />
    <Pill x={540} y={1530} text="confiance = intimité" bg="#fff" delay={20} size={64} />
  </AbsoluteFill>
);

const Nyt: React.FC<P> = () => (
  <AbsoluteFill>
    <Bar />
    <Newspaper x={540} y={250} w={860} delay={4} />
    <Character who="author" x={300} y={FEET} h={640} expr="smile" talking delay={2} />
    <Character who="friend" x={790} y={FEET} h={640} expr="smile" flip delay={8} />
    <Mug x={540} y={1230} size={140} />
  </AbsoluteFill>
);

const Love: React.FC<P> = () => {
  const f = useCurrentFrame();
  const s = 1 + Math.max(0, Math.sin(f / 4)) * 0.06;
  return (
    <AbsoluteFill>
      <Sunburst a={C.coral} b="#FF7F98" speed={0.4} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${s})`}}>
        <Heart x={540} y={760} size={900} beat={false} />
      </div>
      <Character who="author" x={380} y={FEET} h={680} expr="love" arms={['down', 'up']} />
      <Character who="friend" x={700} y={FEET} h={680} expr="love" arms={['up', 'down']} flip />
      <Confetti seed="l" n={40} />
    </AbsoluteFill>
  );
};

const WarningScene: React.FC<P> = () => (
  <AbsoluteFill>
    <Pastel color="#FFE9C7" dot="#FFDDA6" />
    <Warning x={540} y={500} size={520} />
    <Character who="malik" x={300} y={FEET} h={640} expr="nervous" arms={['down', 'point']} />
    <Card x={530} y={1080} w={200} text="?!" fontSize={70} color={C.yellow} rotate={8} delay={6} />
    <Character who="jade" x={800} y={FEET} h={640} expr="annoyed" arms={['cross', 'cross']} flip />
  </AbsoluteFill>
);

const Twist: React.FC<P> = ({d}) => {
  const f = useCurrentFrame();
  const late = f > d * 0.45;
  return (
    <AbsoluteFill>
      <Room wall={C.night} stripe="#38336B" night couch={C.coral} lamp />
      <div style={{position: 'absolute', left: 100, top: 300}}>
        <Clock x={110} y={110} size={220} speed={late ? 8 : 1} />
      </div>
      {late && <Bubble x={330} y={690} w={520} text="…et en CM2, personne ne m'a invité à son anniv 😭" size={50} delay={0} />}
      <Character who="malik" x={290} y={FEET} h={680} expr={late ? 'sad' : 'happy'} arms={late ? ['up', 'wave'] : ['hold', 'hold']} talking={late} />
      {!late && <Card x={290} y={1380} w={200} text="Q1" fontSize={64} color={C.yellow} rotate={-6} />}
      <Character who="jade" x={800} y={FEET} h={660} expr="smug" arms={['down', 'hold']} flip />
      <Mug x={730} y={1420} size={110} />
    </AbsoluteFill>
  );
};

const Cta: React.FC<P> = () => {
  const f = useCurrentFrame();
  const plane = interpolate(f, [30, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Sunburst a={C.yellow} b="#FFE58A" />
      <Phone x={540} y={170} w={560} delay={0}>
        <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 700, color: OL}}>
          <div style={{fontSize: 46, opacity: 0.7}}>QUESTION</div>
          <div style={{fontSize: 260, lineHeight: 1, color: C.coral, WebkitTextStroke: `10px ${OL}`, paintOrder: 'stroke fill'}}>36</div>
          <div style={{fontSize: 44, padding: '0 40px'}}>À qui tu la poserais ?</div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            left: '50%',
            transform: `translateX(-50%) scale(${1 + Math.max(0, Math.sin(f / 4)) * 0.12})`,
            background: C.coral,
            color: '#fff',
            border: `8px solid ${OL}`,
            borderRadius: 999,
            padding: '18px 50px',
            fontFamily: FONT_TITLE,
            fontWeight: 700,
            fontSize: 54,
            whiteSpace: 'nowrap',
          }}
        >
          Partager ➜
        </div>
      </Phone>
      <div style={{position: 'absolute', left: interpolate(plane, [0, 1], [700, 1150]), top: interpolate(plane, [0, 1], [1050, 500]), fontSize: 150, transform: 'rotate(-20deg)'}}>
        💌
      </div>
      <Character who="ines" x={210} y={FEET + 60} h={560} expr="wow" arms={['up', 'down']} delay={6} />
      <Character who="theo" x={870} y={FEET + 60} h={580} expr="happy" arms={['down', 'up']} flip delay={10} />
    </AbsoluteFill>
  );
};

const Outro: React.FC<P> = () => {
  const p = usePop(10);
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Pastel color={C.cream} dot="#F6E3BE" />
      <div style={{position: 'absolute', left: 540 - 230, top: 140, transform: `scale(${usePop(0, 9)})`}}>
        <LogoMark size={460} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', transform: `scale(${p})`}}>
        <Wordmark size={150} />
      </div>
      <Pill x={540} y={950} text="Partie 2 : la liste complète ➜" bg={C.coral} color="#fff" size={56} delay={18} />
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 1110,
          transform: `translate(-50%,-50%) scale(${usePop(26) * (1 + Math.max(0, Math.sin(f / 4)) * 0.08)})`,
          background: '#FE2C55',
          color: '#fff',
          border: `8px solid ${OL}`,
          borderRadius: 30,
          padding: '14px 50px',
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          fontSize: 62,
          boxShadow: `0 10px 0 ${OL}`,
        }}
      >
        + Abonne-toi
      </div>
      <Character who="ines" x={160} y={FEET + 80} h={470} expr="happy" arms={['wave', 'down']} delay={4} />
      <Character who="malik" x={400} y={FEET + 80} h={480} expr="wink" arms={['down', 'wave']} delay={8} />
      <Character who="jade" x={650} y={FEET + 80} h={470} expr="smile" arms={['wave', 'down']} delay={12} flip />
      <Character who="theo" x={890} y={FEET + 80} h={500} expr="happy" arms={['down', 'wave']} delay={16} flip />
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC<P>> = {
  hook: Hook,
  malik: Malik,
  lab: LabScene,
  cards: Cards,
  q1: Q1,
  q2: Q2,
  result: Result,
  married: Married,
  secret: Secret,
  brain: BrainScene,
  nyt: Nyt,
  love: Love,
  warning: WarningScene,
  twist: Twist,
  cta: Cta,
  outro: Outro,
};

/** Habillage commun : entrée « punchy » + lent zoom caméra. */
export const SceneWrap: React.FC<{d: number; children: React.ReactNode}> = ({d, children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: f, fps, config: {damping: 14, stiffness: 200}});
  const zoom = interpolate(f, [0, d], [1, 1.05]) * interpolate(enter, [0, 1], [1.12, 1]);
  const flash = interpolate(f, [0, 4], [0.5, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 45%'}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
