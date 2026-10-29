'use client';
/**
 * Opening intro: on a white screen a gold ring draws itself around the GTCFX logo while a navy dot
 * orbits it, then the intro fades away to reveal the page.
 *
 *  - plays once per browser session, never for visitors who turn off animations (decided before paint by
 *    the inline script in introScript.js → <html data-intro="play|skip">)
 *  - the page loads underneath the whole time; ~1.3 s (longer only while the page is still loading,
 *    never more than 2.4 s); a CSS fallback removes it even if scripts fail (globals.css → #gtc-intro)
 *  - fires `gtc:intro-leave` as it starts fading (the region popups open then, underneath it, so the intro
 *    dissolves straight into the popup) and `gtc:intro-done` once it is gone (geo/geoClient.js)
 */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { logoSrc } from '@/components/shared/Logo';

const MIN_MS = 1300;
const MAX_MS = 2400;
const EASE = [0.22, 1, 0.36, 1];

function leaving() {
  window.__gtcIntroLeaving = true;
  window.dispatchEvent(new Event('gtc:intro-leave'));
}

function finish() {
  try {
    sessionStorage.setItem('gtc_intro', '1');
  } catch {}
  document.documentElement.dataset.intro = 'done';
  window.__gtcIntroDone = true;
  window.dispatchEvent(new Event('gtc:intro-done'));
}

/** The official colour logo (174 × 62). */
function LogoImg({ className }) {
  // eslint-disable-next-line @next/next/no-img-element -- must paint immediately, no optimiser round-trip
  return <img src={logoSrc(false)} alt="" width={174} height={62} fetchPriority="high" decoding="sync" className={className} draggable={false} />;
}

/** White full-screen layer; `out` = fading away. */
function Screen({ label, out, onDone, children }) {
  return (
    <motion.div
      id="gtc-intro"
      role="status"
      aria-label={label}
      className="fixed inset-0 z-[200] place-items-center bg-white"
      animate={{ opacity: out ? 0 : 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      onAnimationComplete={() => out && onDone()}
    >
      <motion.div className="relative grid place-items-center" dir="ltr" aria-hidden animate={{ scale: out ? 1.05 : 1 }} transition={{ duration: 0.5, ease: EASE }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Gold ring drawing round the logo, navy dot in orbit. */
function Ring(p) {
  return (
    <Screen {...p}>
      <svg viewBox="0 0 300 300" className="absolute size-[260px] md:size-[300px]">
        <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(41,59,147,0.08)" strokeWidth="2" />
        <motion.circle cx="150" cy="150" r="140" fill="none" stroke="#b68756" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-90 150 150)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }} />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}>
          <circle cx="150" cy="150" r="140" fill="none" />
          <circle cx="150" cy="10" r="5" fill="#293b93" />
        </motion.g>
      </svg>
      <motion.span className="block" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15, ease: EASE }}>
        <LogoImg className="h-auto w-40 md:w-44" />
      </motion.span>
    </Screen>
  );
}

export default function IntroLoader() {
  const t = useTranslations('geo.intro');
  const [phase, setPhase] = useState('show'); // show → leave → gone

  useEffect(() => {
    if (document.documentElement.dataset.intro !== 'play') {
      setPhase('gone');
      return;
    }
    let cancelled = false;
    const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));
    const minWait = new Promise((r) => setTimeout(r, MIN_MS));
    const maxWait = new Promise((r) => setTimeout(r, MAX_MS));
    Promise.race([Promise.all([loaded, minWait]), maxWait]).then(() => {
      if (cancelled) return;
      leaving();
      setPhase('leave');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === 'gone') return null;
  return (
    <Ring
      label={t('loading')}
      out={phase === 'leave'}
      onDone={() => {
        finish();
        setPhase('gone');
      }}
    />
  );
}
