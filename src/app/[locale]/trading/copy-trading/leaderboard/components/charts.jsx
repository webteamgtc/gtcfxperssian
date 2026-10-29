'use client';
/**
 * Pure-SVG charts for the trader page (no chart library):
 *  - PerfChart: area/line with y grid, date axis and a hover crosshair + tooltip.
 *  - MonthlyBars: positive / negative monthly return bars around a zero line.
 *  - Donut: share-of-trades ring.
 */
import { useId, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const W = 800;
const H = 300;
const PAD_Y = 12;

const ticks = (min, max, n) => (min === max ? [min] : Array.from({ length: n }, (_, i) => min + ((max - min) / (n - 1)) * i));
const shortDate = (t) => new Date(t).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
const fullDate = (t) => new Date(t).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/** Line/area chart; axis labels are HTML overlays so they don't stretch with the SVG. */
export function PerfChart({ points, format, className }) {
  const gid = useId().replace(/:/g, '');
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  const geo = useMemo(() => {
    if (points.length < 2) return null;
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    let y0 = Math.min(...ys, 0);
    let y1 = Math.max(...ys, 0);
    if (y0 === y1) y1 = y0 + 1;
    const sx = (x) => ((x - x0) / (x1 - x0 || 1)) * W;
    const sy = (y) => PAD_Y + (1 - (y - y0) / (y1 - y0)) * (H - PAD_Y * 2);
    const xy = points.map((p) => [sx(p.x), sy(p.y)]);
    const line = xy.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    return { sx, sy, xy, line, zero: sy(0), up: points[points.length - 1].y >= 0, yTicks: ticks(y0, y1, 5), xTicks: ticks(x0, x1, 5) };
  }, [points]);

  if (!geo) return <div className={cn('grid place-items-center text-sm text-ink/45', className)}>—</div>;
  const color = geo.up ? '#16a34a' : '#dc2626';
  const pctY = (y) => `${(geo.sy(y) / H) * 100}%`;

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    for (let i = 1; i < geo.xy.length; i += 1) if (Math.abs(geo.xy[i][0] - x) < Math.abs(geo.xy[best][0] - x)) best = i;
    setHover(best);
  };
  const hp = hover != null ? geo.xy[hover] : null;

  return (
    <div className={cn('flex flex-col', className)} dir="ltr">
      <div className="relative flex min-h-0 flex-1">
        {/* y axis */}
        <div className="relative w-14 shrink-0">
          {geo.yTicks.map((v) => (
            <span key={v} className="absolute end-2 -translate-y-1/2 text-[11px] tabular-nums text-ink/40" style={{ top: pctY(v) }}>
              {format(v, true)}
            </span>
          ))}
        </div>
        {/* plot */}
        <div className="relative min-w-0 flex-1">
          {geo.yTicks.map((v) => (
            <span key={v} className="absolute inset-x-0 border-t border-dashed border-brand/10" style={{ top: pctY(v) }} aria-hidden />
          ))}
          <span className="absolute inset-x-0 border-t border-brand/25" style={{ top: pctY(0) }} aria-hidden />
          <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" preserveAspectRatio="none" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img">
            <defs>
              <linearGradient id={`pf-${gid}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path key={`a-${geo.line}`} d={`${geo.line} L${W} ${geo.zero} L0 ${geo.zero} Z`} fill={`url(#pf-${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} />
            <motion.path key={`l-${geo.line}`} d={geo.line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE }} />
            {hp && <line x1={hp[0]} x2={hp[0]} y1="0" y2={H} stroke="rgba(41,59,147,0.3)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
          </svg>
          {hp && (
            <>
              <span className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white" style={{ left: `${(hp[0] / W) * 100}%`, top: `${(hp[1] / H) * 100}%`, borderColor: color }} />
              <div className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-xl bg-ink/90 px-3 py-2 text-center text-xs text-white shadow-xl backdrop-blur" style={{ left: `${Math.min(88, Math.max(12, (hp[0] / W) * 100))}%` }}>
                <div className="text-white/60">{fullDate(points[hover].x)}</div>
                <div className="mt-0.5 font-bold tabular-nums">{format(points[hover].y)}</div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* x axis */}
      <div className="relative ms-14 mt-2 h-4">
        {geo.xTicks.map((x, i) => (
          <span key={x} className={cn('absolute text-[11px] text-ink/40', i === 0 ? '' : i === geo.xTicks.length - 1 ? '-translate-x-full' : '-translate-x-1/2')} style={{ left: `${(geo.sx(x) / W) * 100}%` }}>
            {shortDate(x)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Monthly return bars (green up / red down) with month labels and value on hover. */
export function MonthlyBars({ months, className }) {
  const [hover, setHover] = useState(null);
  const vals = months.map((m) => Number(m.returnChange) || 0);
  const maxAbs = Math.max(...vals.map(Math.abs), 1);
  const hasNeg = vals.some((v) => v < 0);
  const zeroPct = hasNeg ? 50 : 100;

  return (
    <div className={cn('relative flex items-stretch gap-1.5 sm:gap-2.5', className)} dir="ltr">
      <span className="pointer-events-none absolute inset-x-0 h-px bg-brand/20" style={{ top: `${zeroPct}%` }} aria-hidden />
      {months.map((m, i) => {
        const v = vals[i];
        const h = (Math.abs(v) / maxAbs) * (hasNeg ? 50 : 100);
        const label = new Date(m.month).toLocaleDateString('en-US', { month: 'short' });
        return (
          <div key={m.month} className="group relative flex min-w-0 flex-1 flex-col" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <div className="relative flex-1">
              <motion.span className={cn('absolute inset-x-[12%] rounded-md transition-opacity', v >= 0 ? 'bg-gradient-to-t from-up/70 to-up' : 'bg-gradient-to-b from-down/70 to-down', hover != null && hover !== i && 'opacity-40')} style={v >= 0 ? { bottom: `${100 - zeroPct}%` } : { top: `${zeroPct}%` }} initial={{ height: 0 }} whileInView={{ height: `${Math.max(h, v ? 1.5 : 0)}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.04, ease: EASE }} />
              {hover === i && (
                <span className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[11px] font-bold text-white shadow-lg" style={v >= 0 ? { bottom: `calc(${100 - zeroPct + h}% + 6px)` } : { top: `calc(${zeroPct + h}% + 6px)` }}>
                  {v >= 0 ? '+' : ''}
                  {v.toFixed(2)}%
                </span>
              )}
            </div>
            <span className="mt-2 truncate text-center text-[10px] font-medium text-ink/45">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

const DONUT_COLORS = ['#293b93', '#b68756', '#16a34a', '#8390d4', '#d2a67a', '#0ea5e9', '#a855f7', '#94a3b8'];
export const donutColor = (i) => DONUT_COLORS[i % DONUT_COLORS.length];

/** Donut of shares (percent values), segments animate in one after another. */
export function Donut({ shares, center, className }) {
  const R = 40;
  const C = 2 * Math.PI * R;
  const total = shares.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return (
    <div className={cn('relative', className)} dir="ltr">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(41,59,147,0.08)" strokeWidth="14" />
        {shares.map((s, i) => {
          const len = (s / total) * C;
          const off = acc;
          acc += len;
          return <motion.circle key={i} cx="50" cy="50" r={R} fill="none" stroke={donutColor(i)} strokeWidth="14" strokeDasharray={`${Math.max(len - 0.8, 0.4)} ${C}`} initial={{ strokeDashoffset: -off + len, opacity: 0 }} whileInView={{ strokeDashoffset: -off, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 * i, ease: EASE }} />;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{center}</div>
    </div>
  );
}
