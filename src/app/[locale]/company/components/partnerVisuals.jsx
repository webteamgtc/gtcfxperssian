'use client';
import { motion } from 'motion/react';
import { Handshake, Crown, User } from 'lucide-react';

/** Partners: an IB hub with clients orbiting and "referrals" travelling in along the spokes. */
export function NetworkVisual({ className }) {
  const nodes = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2);
  const R = 100;
  return (
    <div dir="ltr" className={className} aria-hidden>
      <div className="relative mx-auto size-[260px]">
        {[R, R * 0.62].map((r, k) => (
          <span key={r} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15" style={{ width: r * 2, height: r * 2 }} />
        ))}
        <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
          <svg viewBox="-130 -130 260 260" className="absolute inset-0 size-full overflow-visible">
            {nodes.map((a, i) => (
              <g key={i}>
                <line x1="0" y1="0" x2={Math.cos(a) * R} y2={Math.sin(a) * R} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <motion.circle r="2.6" fill="#d2a67a" animate={{ cx: [Math.cos(a) * R, 0], cy: [Math.sin(a) * R, 0], opacity: [0, 1, 0] }} transition={{ duration: 2.2, delay: i * 0.37, repeat: Infinity, ease: 'easeIn' }} />
              </g>
            ))}
          </svg>
          {nodes.map((a, i) => (
            <motion.span
              key={i}
              className="absolute grid size-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur"
              style={{ left: `calc(50% + ${Math.cos(a) * R}px - 18px)`, top: `calc(50% + ${Math.sin(a) * R}px - 18px)` }}
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
              <User className="size-4" />
            </motion.span>
          ))}
        </motion.div>
        <motion.span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-600 text-white shadow-[0_0_40px_rgba(182,135,86,0.55)]" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.2, repeat: Infinity }}>
          <Handshake className="size-7" />
        </motion.span>
      </div>
    </div>
  );
}

/** Prime: a live-looking depth chart (bids / asks) around a mid price. */
export function LiquidityVisual({ className }) {
  const bars = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div dir="ltr" className={className} aria-hidden>
      <div className="relative mx-auto flex h-[220px] w-full max-w-[320px] items-end justify-center gap-[5px]">
        {bars.map((i) => {
          const side = i < 7 ? 'bid' : 'ask';
          const dist = side === 'bid' ? 7 - i : i - 6; // distance from the mid
          const base = 18 + dist * 11;
          return (
            <motion.span
              key={i}
              className={side === 'bid' ? 'w-full rounded-t-md bg-gradient-to-t from-white/10 to-white/50' : 'w-full rounded-t-md bg-gradient-to-t from-gold/20 to-gold-200'}
              animate={{ height: [`${base}%`, `${Math.min(96, base + 14)}%`, `${Math.max(10, base - 8)}%`, `${base}%`] }}
              transition={{ duration: 3 + (i % 4) * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
            />
          );
        })}
        {/* mid price */}
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/60 to-transparent" />
        <motion.span className="absolute left-1/2 top-3 grid size-12 -translate-x-1/2 place-items-center rounded-2xl bg-white text-gold-700 shadow-[0_0_40px_rgba(255,255,255,0.35)]" animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <Crown className="size-6" />
        </motion.span>
      </div>
    </div>
  );
}
