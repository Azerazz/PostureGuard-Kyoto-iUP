import React from 'react';
import {Composition, Still} from 'remotion';
import {Cover} from './Cover';
import {LogoFull, ProfilePicture} from './components/Logo';
import {Video, useFonts, type Timeline} from './Video';
import {SCENES} from './videos/v1';
import {SCENES_V2} from './videos/v2';
import {SCENES_ALCOOL} from './videos/alcool';
import t1 from './timelines/v1.json';
import t2 from './timelines/v2.json';
import tAlcool from './timelines/alcool.json';
import {H, W} from './theme';

const WithFonts: React.FC<{C: React.FC}> = ({C}) => {
  useFonts();
  return <C />;
};

// un composant par vidéo : les props restent sérialisables (seulement « music »)
const VIDEOS = [
  {id: 'V1', timeline: t1 as Timeline, C: (p: {music?: boolean}) => <Video slug="v1" scenes={SCENES} timeline={t1 as Timeline} music={p.music} />},
  {id: 'V2', timeline: t2 as Timeline, C: (p: {music?: boolean}) => <Video slug="v2" scenes={SCENES_V2} timeline={t2 as Timeline} music={p.music} />},
  {id: 'ALCOOL', timeline: tAlcool as Timeline, C: (p: {music?: boolean}) => <Video slug="alcool" scenes={SCENES_ALCOOL} timeline={tAlcool as Timeline} music={p.music} />},
];

export const Root: React.FC = () => (
  <>
    {VIDEOS.map((v) => (
      <Composition
        key={v.id}
        id={v.id}
        component={v.C}
        defaultProps={{music: false}}
        durationInFrames={v.timeline.durationInFrames}
        fps={v.timeline.fps}
        width={W}
        height={H}
      />
    ))}
    <Still id="Cover" component={Cover} width={W} height={H} />
    <Still id="ProfilePicture" component={() => <WithFonts C={ProfilePicture} />} width={1080} height={1080} />
    <Still id="LogoFull" component={() => <WithFonts C={LogoFull} />} width={1080} height={1400} />
  </>
);
