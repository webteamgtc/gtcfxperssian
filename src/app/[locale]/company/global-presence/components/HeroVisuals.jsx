'use client';
/** Global Presence hero visual: the five licence cards turning on a 3D ring. */
import { useState } from 'react';
import { useReducedMotion } from 'motion/react';

const acronym = (s = '') => s.match(/\(([^)]+)\)\s*$/)?.[1] ?? s;
const rowValue = (e, id) => e.rows.find((r) => r.id === id)?.value;

/** Five licence cards on a ring, pausing on hover (and for reduced motion). */
export function LicenceRing({ entities, licenceLabel }) {
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = entities.length;
  return (
    <div dir="ltr" className="relative mx-auto flex h-[340px] w-full max-w-[520px] items-center justify-center overflow-hidden [--ring-r:150px] [perspective:1100px] md:h-[440px] md:[--ring-r:220px] lg:overflow-visible" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-hidden>
      {/* floor glow */}
      <span className="absolute bottom-6 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-[100%] bg-brand-400/30 blur-2xl" />
      <span className="absolute bottom-10 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="relative h-52 w-40 animate-[ring-spin_22s_linear_infinite] [transform-style:preserve-3d] md:h-60 md:w-48" style={{ animationPlayState: paused || reduce ? 'paused' : 'running' }}>
        {entities.map((e, i) => (
          <div key={e.id} className="absolute inset-0 [transform-style:preserve-3d]" style={{ transform: `rotateY(${(360 / n) * i}deg) translateZ(var(--ring-r))` }}>
            {/* card back (seen while it travels behind) */}
            <div className="absolute inset-0 grid place-items-center rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-brand-800 to-brand-950 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="text-sm font-extrabold tracking-[0.2em] text-white/25">
                GTC<span className="text-gold/50">FX</span>
              </span>
            </div>
            <div className="is-dark relative flex size-full flex-col overflow-hidden rounded-[1.4rem] border border-white/15 bg-gradient-to-br from-brand-600/95 via-brand-800/95 to-brand-950/95 p-4 text-white shadow-2xl shadow-black/40 [backface-visibility:hidden] md:p-5">
              <span className="absolute -end-10 -top-10 size-28 rounded-full bg-gold/30 blur-2xl" />
              <span className="pointer-events-none absolute -bottom-6 -end-2 text-7xl font-black leading-none text-white/[0.07]">{e.code}</span>
              <div className="relative flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-sm font-extrabold text-gold-200 ring-1 ring-white/20">{e.code}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/85">{acronym(rowValue(e, 'authority'))}</span>
              </div>
              <div className="relative mt-4 text-[13px] font-bold leading-snug md:text-sm">{e.name}</div>
              <div className="relative mt-0.5 text-[10px] text-white/50">{e.place}</div>
              <div className="relative mt-auto">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">{licenceLabel}</div>
                <div className="mt-0.5 truncate font-mono text-[13px] font-bold text-gold-200">{rowValue(e, 'licence')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
