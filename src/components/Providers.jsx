'use client';
import { MotionConfig } from 'motion/react';
import IntroLoader from './shared/intro/IntroLoader';
import GeoGate from './shared/geo/GeoGate';

export default function Providers({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <IntroLoader />
      {children}
      <GeoGate />
    </MotionConfig>
  );
}
