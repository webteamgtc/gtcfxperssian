'use client';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  animate
} from 'motion/react';
import { cn } from '@/lib/utils';

export const EASE = [0.22, 1, 0.36, 1];

/* ---------- Reveal: fade / slide / scale / blur in on scroll ---------- */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  x = 0,
  scale = 1,
  blur = 6,
  duration = 0.8,
  once = true,
  amount = 0.25,
  as = 'div',
  ...rest
}) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, x, scale, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/* ---------- HeroIn: above-the-fold content that slides in on load but is never hidden ----------
   Use it instead of Reveal in page heroes: Reveal starts at opacity 0 until scripts run, which delays the
   page's Largest Contentful Paint (Core Web Vitals). HeroIn only moves, so the text paints immediately. */
export function HeroIn({ children, className, delay = 0, y = 16, duration = 0.8, as = 'div', ...rest }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp className={className} initial={{ y }} animate={{ y: 0 }} transition={{ duration, delay, ease: EASE }} {...rest}>
      {children}
    </Comp>
  );
}

/* ---------- Stagger: children animate one after another ---------- */
export function Stagger({ children, className, stagger = 0.09, delay = 0, amount = 0.2, as = 'div' }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Comp>
  );
}

export const itemVariants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.75, ease: EASE } }
};

export function StaggerItem({ children, className, variants = itemVariants, as = 'div', ...rest }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp className={className} variants={variants} {...rest}>
      {children}
    </Comp>
  );
}

/* ---------- WordReveal: each word slides up from a mask ---------- */
export function WordReveal({ text, className, wordClassName, delay = 0, stagger = 0.06, as = 'span', immediate = false }) {
  const words = String(text).split(' ');
  const Comp = motion[as] ?? motion.span;
  const trigger = immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, amount: 0.4 } };
  return (
    <Comp
      className={cn('inline', className)}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom" aria-hidden>
          <motion.span
            className={cn('inline-block', wordClassName)}
            variants={{
              hidden: { y: '110%', rotate: 4, opacity: 0 },
              show: { y: '0%', rotate: 0, opacity: 1, transition: { duration: 0.9, ease: EASE } }
            }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </Comp>
  );
}

/* ---------- TextGenerate: words go from blurred to sharp (quotes) ---------- */
export function TextGenerate({ text, className, delay = 0, stagger = 0.035 }) {
  const words = String(text).split(' ');
  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, filter: 'blur(8px)', y: 6 },
            show: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.5 } }
          }}
        >
          {w}
          {i < words.length - 1 && ' '}
        </motion.span>
      ))}
    </motion.p>
  );
}

/* ---------- CountUp: animated number when in view ---------- */
export function CountUp({ value, prefix = '', suffix = '', duration = 2.2, className, locale = 'en-US', grouping = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v)
    });
    return () => controls.stop();
  }, [inView, value, duration]);
  const decimals = value % 1 !== 0 ? 1 : 0;
  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {Number(display).toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouping })}
      {suffix}
    </span>
  );
}

/* ---------- Marquee: infinite horizontal scroll ---------- */
export function Marquee({ children, className, reverse = false, duration = 40, gap = '1rem', pauseOnHover = true }) {
  return (
    <div
      dir="ltr"
      className={cn('group flex overflow-hidden', className)}
      style={{ '--marquee-duration': `${duration}s`, '--marquee-gap': gap, gap }}
    >
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1}
          className={cn(
            'flex shrink-0 items-center',
            reverse ? 'animate-marquee-reverse' : 'animate-marquee',
            pauseOnHover && 'group-hover:[animation-play-state:paused]'
          )}
          style={{ gap }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/* ---------- TiltCard: 3D tilt following the cursor ---------- */
export function TiltCard({ children, className, max = 10, glare = true, style }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const gx = useTransform(mx, [0, 1], ['0%', '100%']);
  const gy = useTransform(my, [0, 1], ['0%', '100%']);
  const glareBg = useTransform([gx, gy], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.35), transparent 55%)`);

  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    mx.set(0.5);
    my.set(0.5);
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000, transformStyle: 'preserve-3d', ...style }}
      className={cn('relative', className)}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

/* ---------- SpotlightCard: glow follows the cursor ---------- */
export function SpotlightCard({ children, className, color = 'rgba(182,135,86,0.22)', size = 420, ...rest }) {
  const ref = useRef(null);
  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--sx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--sy', `${e.clientY - r.top}px`);
  }
  return (
    <div ref={ref} onMouseMove={onMove} className={cn('group relative overflow-hidden', className)} {...rest}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(${size}px circle at var(--sx, 50%) var(--sy, 50%), ${color}, transparent 60%)` }}
      />
      {children}
    </div>
  );
}

/* ---------- Magnetic: element pulls toward the cursor ---------- */
export function Magnetic({ children, className, strength = 0.35 }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 250, damping: 15 });
  const y = useSpring(0, { stiffness: 250, damping: 15 });
  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x, y }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Parallax: element drifts while scrolling ---------- */
export function Parallax({ children, className, offset = 80 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ---------- MaskReveal: image wipes in with clip-path ---------- */
export function MaskReveal({ children, className, delay = 0, from = 'bottom' }) {
  const ref = useRef(null);
  // observe an unclipped wrapper (clip-path on the target itself blocks IntersectionObserver)
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const start = {
    bottom: 'inset(100% 0% 0% 0% round 28px)',
    left: 'inset(0% 100% 0% 0% round 28px)',
    right: 'inset(0% 0% 0% 100% round 28px)',
    circle: 'circle(0% at 50% 50%)'
  }[from];
  const end = from === 'circle' ? 'circle(75% at 50% 50%)' : 'inset(0% 0% 0% 0% round 28px)';
  return (
    <div ref={ref} className={className}>
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: start }}
        animate={inView ? { clipPath: end } : { clipPath: start }}
        transition={{ duration: 1.2, delay, ease: EASE }}
      >
        <motion.div
          className="relative h-full w-full"
          initial={{ scale: 1.25 }}
          animate={inView ? { scale: 1 } : { scale: 1.25 }}
          transition={{ duration: 1.6, delay, ease: EASE }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ---------- ScrollProgress: thin bar at the top of the page ---------- */
export function ScrollProgress({ className }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return (
    <motion.div
      style={{ scaleX }}
      className={cn('fixed inset-x-0 top-0 z-[70] h-[3px] origin-left rtl:origin-right bg-gradient-to-r from-brand via-brand-400 to-gold', className)}
    />
  );
}

/* ---------- AnimatedBeamLine: SVG line drawing on scroll ---------- */
export function DrawLine({ d, className, stroke = '#b68756', width = 2, delay = 0, duration = 2 }) {
  return (
    <motion.path
      d={d}
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration, delay, ease: 'easeInOut' }}
    />
  );
}
