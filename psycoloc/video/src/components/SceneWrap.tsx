import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

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
