import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile} from 'remotion';
import {Subtitles} from './components/Subtitles';
import {SCENES, SceneWrap} from './Scenes';
import timeline from './timeline.json';

const DING = new Set(['married', 'love', 'cta']);

export const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
};

export const Video: React.FC<{music?: boolean}> = ({music = true}) => {
  useFonts();
  const {fps, scenes, durationInFrames} = timeline;
  const starts = scenes.map((s, i) => (i === 0 ? 0 : Math.round(s.start * fps)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scenes.map((s, i) => {
        const from = starts[i];
        const d = (i + 1 < scenes.length ? starts[i + 1] : durationInFrames) - from;
        const Scene = SCENES[s.id];
        return (
          <Sequence key={s.id} from={from} durationInFrames={d} name={s.id}>
            <SceneWrap d={d}>
              <Scene d={d} />
            </SceneWrap>
            {i > 0 && <Audio src={staticFile(DING.has(s.id) ? 'ding.wav' : 'pop.wav')} volume={DING.has(s.id) ? 0.18 : 0.14} />}
          </Sequence>
        );
      })}
      <Subtitles scenes={scenes} />
      {music && <Audio src={staticFile('music.wav')} volume={0.09} />}
      <Audio src={staticFile('voice.wav')} volume={1} />
    </AbsoluteFill>
  );
};
