'use client';
/** Small animated line-art illustrations for the Why GTC Group sections (navy + gold, no images). */
import { motion } from 'motion/react';

const NAVY = '#293b93';
const GOLD = '#b68756';
const loop = (duration, extra = {}) => ({ duration, repeat: Infinity, ease: 'easeInOut', ...extra });

/* ---------- Commitments (viewBox -60 -60 120 120) ---------- */

// Transparency: a lens sweeps across a document
function Transparency({ light }) {
  const s = light ? '#ffffff' : NAVY;
  return (
    <svg viewBox="-60 -60 120 120" className="size-full" aria-hidden>
      <rect x="-30" y="-40" width="60" height="80" rx="8" fill="none" stroke={s} strokeOpacity="0.5" />
      {[-24, -12, 0, 12, 24].map((y, i) => (
        <rect key={y} x="-20" y={y} width={i % 2 ? 28 : 40} height="3" rx="1.5" fill={s} fillOpacity="0.25" />
      ))}
      <motion.g animate={{ x: [-14, 14, -14], y: [-16, 14, -16] }} transition={loop(5)}>
        <circle r="14" fill={GOLD} fillOpacity="0.15" stroke={GOLD} strokeWidth="2" />
        <line x1="10" y1="10" x2="20" y2="20" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}
// Security: shield with a lock and a pulse ring
function Security({ light }) {
  const s = light ? '#ffffff' : NAVY;
  return (
    <svg viewBox="-60 -60 120 120" className="size-full" aria-hidden>
      <motion.circle r="30" fill="none" stroke={GOLD} animate={{ r: [30, 54], opacity: [0.6, 0] }} transition={{ duration: 2.4, repeat: Infinity }} />
      <path d="M0 -42 L32 -30 L32 0 C32 22 16 36 0 44 C-16 36 -32 22 -32 0 L-32 -30 Z" fill={s} fillOpacity="0.06" stroke={s} strokeOpacity="0.6" strokeWidth="1.5" />
      <rect x="-12" y="-4" width="24" height="20" rx="4" fill={GOLD} />
      <motion.path d="M-7 -4 V-11 A7 7 0 0 1 7 -11 V-4" fill="none" stroke={GOLD} strokeWidth="3" animate={{ y: [0, -4, 0] }} transition={loop(2.4)} />
    </svg>
  );
}
// Professionalism: bars grow and a trend line draws
function Professionalism({ light }) {
  const s = light ? '#ffffff' : NAVY;
  const bars = [16, 26, 20, 36, 44];
  return (
    <svg viewBox="-60 -60 120 120" className="size-full" aria-hidden>
      <line x1="-44" x2="44" y1="40" y2="40" stroke={s} strokeOpacity="0.4" />
      {bars.map((h, i) => (
        <motion.rect key={i} x={-40 + i * 17} width="11" rx="3" fill={i === bars.length - 1 ? GOLD : s} fillOpacity={i === bars.length - 1 ? 1 : 0.3} animate={{ height: [h * 0.4, h * 1.5, h * 0.4], y: [40 - h * 0.4, 40 - h * 1.5, 40 - h * 0.4] }} transition={loop(4, { delay: i * 0.15 })} />
      ))}
      <motion.path d="M-36 14 L-18 2 L0 8 L18 -14 L36 -30" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" animate={{ pathLength: [0, 1, 1] }} transition={loop(4)} />
    </svg>
  );
}
// Connectivity: a hub with nodes and data travelling the spokes
function Connectivity({ light }) {
  const s = light ? '#ffffff' : NAVY;
  const nodes = [[-38, -24], [36, -30], [42, 22], [-30, 34], [2, -46]];
  return (
    <svg viewBox="-60 -60 120 120" className="size-full" aria-hidden>
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <line x1="0" y1="0" x2={x} y2={y} stroke={s} strokeOpacity="0.3" />
          <motion.circle r="2.5" fill={GOLD} animate={{ cx: [0, x], cy: [0, y], opacity: [1, 0] }} transition={{ duration: 1.8, delay: i * 0.35, repeat: Infinity }} />
          <circle cx={x} cy={y} r="6" fill={light ? 'transparent' : '#fff'} stroke={s} strokeOpacity="0.6" />
        </g>
      ))}
      <circle r="13" fill={NAVY} stroke={light ? '#fff' : NAVY} />
      <circle r="5" fill={GOLD} />
    </svg>
  );
}
export const COMMITMENT_VISUALS = { transparency: Transparency, security: Security, professionalism: Professionalism, connectivity: Connectivity };

/* ---------- What makes us different (viewBox 0 0 320 220) ---------- */

// Global reach: a globe, three hubs and arcs between them
function Reach({ light }) {
  const s = light ? '#ffffff' : NAVY;
  const hubs = [[118, 78], [196, 96], [150, 132]];
  const arcs = ['M118 78 Q157 40 196 96', 'M196 96 Q190 150 150 132', 'M150 132 Q110 120 118 78'];
  return (
    <svg viewBox="0 0 320 220" className="size-full" aria-hidden>
      <circle cx="160" cy="110" r="84" fill={s} fillOpacity="0.04" stroke={s} strokeOpacity="0.35" />
      <ellipse cx="160" cy="110" rx="84" ry="28" fill="none" stroke={s} strokeOpacity="0.18" />
      <motion.ellipse cx="160" cy="110" ry="84" fill="none" stroke={s} strokeOpacity="0.22" initial={{ rx: 84 }} animate={{ rx: [84, 6, 84] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
      <motion.ellipse cx="160" cy="110" ry="84" fill="none" stroke={s} strokeOpacity="0.22" initial={{ rx: 40 }} animate={{ rx: [40, 84, 6, 40] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
      {arcs.map((d, i) => (
        <motion.path key={i} d={d} fill="none" stroke={GOLD} strokeWidth="1.6" strokeDasharray="4 4" animate={{ strokeDashoffset: [0, -16] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      ))}
      {hubs.map(([x, y], i) => (
        <g key={i}>
          <motion.circle cx={x} cy={y} r="6" fill={GOLD} fillOpacity="0.35" animate={{ r: [6, 16], opacity: [0.6, 0] }} transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }} />
          <circle cx={x} cy={y} r="5" fill={GOLD} />
        </g>
      ))}
    </svg>
  );
}
// No conflicts: a balance that settles level
function Balance({ light }) {
  const s = light ? '#ffffff' : NAVY;
  return (
    <svg viewBox="0 0 320 220" className="size-full" aria-hidden>
      <line x1="160" y1="44" x2="160" y2="180" stroke={s} strokeOpacity="0.6" strokeWidth="2" />
      <rect x="120" y="178" width="80" height="8" rx="4" fill={s} fillOpacity="0.35" />
      <motion.g style={{ transformOrigin: '160px 52px', transformBox: 'view-box' }} animate={{ rotate: [-7, 5, -2, 0, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        <line x1="84" y1="52" x2="236" y2="52" stroke={s} strokeOpacity="0.7" strokeWidth="2" />
        {[84, 236].map((x, i) => (
          <g key={x}>
            <line x1={x} y1="52" x2={x - 22} y2="104" stroke={s} strokeOpacity="0.35" />
            <line x1={x} y1="52" x2={x + 22} y2="104" stroke={s} strokeOpacity="0.35" />
            <path d={`M${x - 28} 104 Q${x} 126 ${x + 28} 104 Z`} fill={i ? GOLD : s} fillOpacity={i ? 0.8 : 0.25} />
          </g>
        ))}
      </motion.g>
      <circle cx="160" cy="44" r="7" fill={GOLD} />
    </svg>
  );
}
// Segregated funds: two separate vaults; deposits only drop into the client side
function Vaults({ light }) {
  const s = light ? '#ffffff' : NAVY;
  return (
    <svg viewBox="0 0 320 220" className="size-full" aria-hidden>
      <rect x="44" y="70" width="108" height="112" rx="14" fill={GOLD} fillOpacity="0.12" stroke={GOLD} strokeWidth="1.6" />
      <rect x="168" y="70" width="108" height="112" rx="14" fill={s} fillOpacity="0.05" stroke={s} strokeOpacity="0.4" />
      <motion.line x1="160" x2="160" y1="56" y2="196" stroke={s} strokeOpacity="0.5" strokeDasharray="5 5" animate={{ strokeDashoffset: [0, -20] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="66" y={160 - i * 14} width="64" height="10" rx="5" fill={GOLD} fillOpacity={0.5 + i * 0.12} />
      ))}
      {[0, 1].map((i) => (
        <rect key={i} x="190" y={160 - i * 14} width="64" height="10" rx="5" fill={s} fillOpacity="0.3" />
      ))}
      <motion.rect x="66" width="64" height="10" rx="5" fill={GOLD} animate={{ y: [20, 92], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeIn' }} />
    </svg>
  );
}
// Real-time risk: a radar sweep with blips
function Radar({ light }) {
  const s = light ? '#ffffff' : NAVY;
  const blips = [[196, 78], [128, 140], [212, 146], [140, 72]];
  return (
    <svg viewBox="0 0 320 220" className="size-full" aria-hidden>
      <defs>
        <linearGradient id="radar-sweep" x1="0" x2="1">
          <stop offset="0" stopColor={GOLD} stopOpacity="0" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {[84, 58, 32].map((r) => (
        <circle key={r} cx="160" cy="110" r={r} fill="none" stroke={s} strokeOpacity="0.25" />
      ))}
      <line x1="76" x2="244" y1="110" y2="110" stroke={s} strokeOpacity="0.15" />
      <line x1="160" x2="160" y1="26" y2="194" stroke={s} strokeOpacity="0.15" />
      <motion.path d="M160 110 L244 110 A84 84 0 0 0 219.4 50.6 Z" fill="url(#radar-sweep)" style={{ transformOrigin: '160px 110px', transformBox: 'view-box' }} animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
      {blips.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="4" fill={GOLD} animate={{ opacity: [0.15, 1, 0.15] }} transition={{ duration: 4, delay: i, repeat: Infinity }} />
      ))}
    </svg>
  );
}
export const EDGE_VISUALS = { reach: Reach, conflicts: Balance, funds: Vaults, risk: Radar };
