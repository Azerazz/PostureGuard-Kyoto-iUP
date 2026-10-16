import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Sunburst} from './components/Backgrounds';
import {Character} from './components/Character';
import {LogoMark} from './components/Logo';
import {BigText, Heart} from './components/Props';
import {C, FONT_TITLE, OL} from './theme';
import {useFonts} from './Video';

/** Miniature de la vidéo 1 (à choisir comme « couverture » sur TikTok). */
export const Cover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Sunburst a={C.pink} b={C.pinkLight} speed={0} />
      <BigText x={540} y={470} text="36" size={480} wobble={false} delay={-40} />
      <div
        style={{
          position: 'absolute',
          top: 760,
          left: 60,
          right: 60,
          textAlign: 'center',
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 1.05,
          color: '#fff',
          WebkitTextStroke: `18px ${OL}`,
          paintOrder: 'stroke fill',
        }}
      >
        questions pour faire <span style={{color: C.yellow}}>tomber amoureux</span>
      </div>
      <Character who="malik" x={330} y={1700} h={640} expr="wink" delay={-40} />
      <Character who="jade" x={750} y={1700} h={640} expr="love" flip delay={-40} />
      <Heart x={540} y={1170} size={150} beat={false} delay={-40} />
      <div style={{position: 'absolute', left: 40, top: 60}}>
        <LogoMark size={170} />
      </div>
    </AbsoluteFill>
  );
};
