'use client';
/**
 * Company hero background: a soft, slowly moving gradient (aurora mesh) in navy and gold,
 * a glowing horizon arc behind the stats and a fine grid that fades out at every edge.
 * No hard edges or boxes; purely decorative (aria-hidden).
 */
import { motion } from 'motion/react';

const BLOBS = [
  { cls: 'start-[-10%] top-[-20%] size-[max(60vw,420px)] max-w-[820px] bg-brand/55', x: [0, 120, -40, 0], y: [0, 60, 120, 0], d: 22 },
  { cls: 'end-[-12%] top-[5%] size-[max(50vw,360px)] max-w-[700px] bg-[#5b6ed2]/35', x: [0, -100, 40, 0], y: [0, 80, -30, 0], d: 26 },
  { cls: 'start-[30%] top-[35%] size-[max(42vw,320px)] max-w-[600px] bg-gold/25', x: [0, 80, -90, 0], y: [0, -50, 30, 0], d: 20 }
];

export default function HeroTradingBackdrop() {
  return (
    <div dir="ltr" className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* aurora mesh */}
      {BLOBS.map((b, i) => (
        <motion.div key={i} className={`absolute aspect-square rounded-full blur-[120px] ${b.cls}`} animate={{ x: b.x, y: b.y }} transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }} />
      ))}

      {/* slow rotating conic sheen */}
      <motion.div
        className="absolute left-1/2 top-[-40%] size-[140vw] max-w-[1800px] -translate-x-1/2 rounded-full opacity-[0.18] [background:conic-gradient(from_0deg,transparent_0deg,#b68756_60deg,transparent_120deg,#293b93_200deg,transparent_260deg,#d2a67a_320deg,transparent_360deg)] [mask-image:radial-gradient(circle,#000_20%,transparent_62%)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      />

      {/* fine grid, faded at every edge */}
      <div className="bg-grid-dark absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_30%,transparent_80%)]" />

      {/* horizon arc behind the stats */}
      <div className="absolute inset-x-[-20%] bottom-[-80%] md:bottom-[-72%] mx-auto aspect-[2/1] rounded-[100%] border-t border-gold/40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(182,135,86,0.28),rgba(41,59,147,0.18)_35%,transparent_65%)] shadow-[0_-30px_120px_-20px_rgba(182,135,86,0.45)]" />
      <motion.div
        className="absolute inset-x-[-20%] bottom-[-80%] md:bottom-[-72%] mx-auto aspect-[2/1] rounded-[100%] border-t border-gold-200/70 [mask-image:linear-gradient(90deg,transparent,#000_45%,#000_55%,transparent)]"
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* soft fade into the next section */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}

/** Light variant: soft drifting navy/gold blobs, a faded grid and the dotted world map. */
export function LightHeroBackdrop() {
  return (
    <div dir="ltr" className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-[#eef1fb] via-[#f6f7fc] to-white" />
      <motion.div className="absolute -start-[10%] -top-[20%] size-[max(50vw,420px)] max-w-[760px] rounded-full bg-brand/15 blur-[120px]" animate={{ x: [0, 90, 0], y: [0, 50, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute -end-[10%] top-[10%] size-[max(40vw,360px)] max-w-[620px] rounded-full bg-gold/20 blur-[120px]" animate={{ x: [0, -80, 0], y: [0, 60, 0] }} transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="bg-grid-light absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_30%,transparent_80%)]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/world-dots.svg" alt="" className="absolute -start-20 top-24 w-[720px] opacity-[0.12]" />
    </div>
  );
}
