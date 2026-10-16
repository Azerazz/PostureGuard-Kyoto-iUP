import React from 'react';
import {Composition, Still} from 'remotion';
import {Cover} from './Cover';
import {LogoFull, ProfilePicture} from './components/Logo';
import {Video, useFonts} from './Video';
import timeline from './timeline.json';
import {H, W} from './theme';

const WithFonts: React.FC<{C: React.FC}> = ({C}) => {
  useFonts();
  return <C />;
};

export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={timeline.durationInFrames} fps={timeline.fps} width={W} height={H} />
    <Still id="Cover" component={Cover} width={W} height={H} />
    <Still id="ProfilePicture" component={() => <WithFonts C={ProfilePicture} />} width={1080} height={1080} />
    <Still id="LogoFull" component={() => <WithFonts C={LogoFull} />} width={1080} height={1400} />
  </>
);
