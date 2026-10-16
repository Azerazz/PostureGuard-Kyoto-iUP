import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT_TITLE, OL} from '../theme';
import {BrainSvg} from './Props';

/** Logo PsyColoc : le cerveau-mascotte coiffé du toit de la coloc. */
export const LogoMark: React.FC<{size: number; bg?: boolean}> = ({size, bg = true}) => (
  <svg width={size} height={size} viewBox="-300 -300 600 600">
    {bg && (
      <g>
        <circle r={290} fill={C.yellow} />
        {Array.from({length: 16}).map((_, i) => {
          const a0 = (i / 16) * Math.PI * 2;
          const a1 = a0 + Math.PI / 16;
          return <path key={i} d={`M0,0 L${Math.cos(a0) * 290},${Math.sin(a0) * 290} L${Math.cos(a1) * 290},${Math.sin(a1) * 290}Z`} fill="#FFE07A" />;
        })}
      </g>
    )}
    <g transform="translate(0,55) scale(0.95)">
      <BrainSvg expr="happy" roof />
    </g>
  </svg>
);

export const Wordmark: React.FC<{size: number}> = ({size}) => (
  <div
    style={{
      fontFamily: FONT_TITLE,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1,
      color: C.coral,
      WebkitTextStroke: `${size * 0.07}px ${OL}`,
      paintOrder: 'stroke fill',
      textShadow: `0 ${size * 0.07}px 0 ${OL}`,
      whiteSpace: 'nowrap',
    }}
  >
    Psy<span style={{color: C.yellow}}>Coloc</span>
  </div>
);

/** Photo de profil TikTok (1080×1080, affichée en rond). */
export const ProfilePicture: React.FC = () => (
  <AbsoluteFill style={{background: C.yellow, alignItems: 'center', justifyContent: 'center'}}>
    <LogoMark size={1080} />
  </AbsoluteFill>
);

/** Logo complet avec nom + promesse. */
export const LogoFull: React.FC = () => (
  <AbsoluteFill style={{background: C.cream, alignItems: 'center', justifyContent: 'center', gap: 30}}>
    <LogoMark size={720} />
    <Wordmark size={190} />
    <div style={{fontFamily: FONT_TITLE, fontWeight: 600, fontSize: 54, color: OL, marginTop: 10, textAlign: 'center', padding: '0 60px'}}>La psycho de ta vie, racontée par 4 colocs</div>
  </AbsoluteFill>
);
