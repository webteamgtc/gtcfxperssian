'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, ShieldCheck, CreditCard } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const ICONS = { language: Languages, compliance: ShieldCheck, payments: CreditCard };
// what orbits the globe for each card — language names, regulators, currencies (not translated on purpose)
const CHIPS = {
  language: ['English', 'العربية', '中文', 'Español', 'Tiếng Việt', 'ไทย', 'Français', 'Русский'],
  compliance: ['ASIC', 'FSC', 'SERC', 'FSCA', 'VFSC', 'FinCom'],
  payments: ['USD', 'EUR', 'AED', 'USDT', 'THB', 'VND', 'INR', 'MYR']
};
// chip positions around the globe (% of the square), evenly on a ring
const ringPos = (i, n) => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { left: `${50 + Math.cos(a) * 44}%`, top: `${50 + Math.sin(a) * 44}%` };
};

/** Light wireframe globe; the chips around it change with the selected card. */
function Globe({ active }) {
  const R = 140;
  const chips = CHIPS[active] ?? [];
  return (
    <div dir="ltr" className="relative mx-auto aspect-square w-full max-w-[480px]" aria-hidden>
      <svg viewBox="-200 -200 400 400" className="absolute inset-0 size-full">
        <defs>
          <radialGradient id="gp-globe" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#dfe3f2" />
          </radialGradient>
        </defs>
        <circle r={R + 46} fill="none" stroke="#293b93" strokeOpacity="0.1" strokeDasharray="2 6" />
        <circle r={R} fill="url(#gp-globe)" stroke="#293b93" strokeOpacity="0.35" />
        {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => (
          <ellipse key={k} cy={k * R} rx={Math.sqrt(1 - k * k) * R} ry={Math.sqrt(1 - k * k) * R * 0.22} fill="none" stroke="#293b93" strokeOpacity="0.12" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.ellipse key={i} ry={R} fill="none" stroke="#293b93" strokeOpacity="0.16" initial={{ rx: R }} animate={{ rx: [R, 0, R] }} transition={{ duration: 14, repeat: Infinity, ease: 'linear', delay: -i * 2.8 }} />
        ))}
        <g transform="rotate(-24)">
          <ellipse rx={R * 1.05} ry={R * 0.45} fill="none" stroke="#b68756" strokeOpacity="0.6" strokeDasharray="3 5" />
          <motion.circle r="5" fill="#b68756" animate={{ cx: [R * 1.05, 0, -R * 1.05, 0, R * 1.05], cy: [0, R * 0.45, 0, -R * 0.45, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} />
        </g>
        <circle r="10" fill="#293b93" />
        <motion.circle r="10" fill="none" stroke="#293b93" animate={{ r: [10, 40], opacity: [0.5, 0] }} transition={{ duration: 2.4, repeat: Infinity }} />
      </svg>
      <AnimatePresence mode="popLayout">
        {chips.map((c, i) => (
          <motion.span
            key={`${active}-${c}`}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg ring-1 md:text-sm',
              i % 3 === 0 ? 'bg-brand text-white shadow-brand/25 ring-brand' : 'bg-white text-brand shadow-brand/10 ring-brand/10'
            )}
            style={ringPos(i, chips.length)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ opacity: { duration: 0.35, delay: i * 0.05 }, scale: { duration: 0.35, delay: i * 0.05 }, y: { duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut' } }}
          >
            {c}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Gray section: globe on one side, the three local-support points on the other. */
export function LocalSupport() {
  const t = useTranslations('globalPresencePage.local');
  const items = t.raw('items');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    // auto-advance on desktop only — on phones it would move the page while people read
    if (paused || !window.matchMedia('(min-width: 1024px)').matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % items.length), 5500);
    return () => clearInterval(id);
  }, [paused, items.length]);

  return (
    <section id="local" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <div className="mt-12 grid items-center gap-10 md:mt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <Globe active={items[active].id} />
          <ul className="grid gap-4" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {items.map((it, i) => {
              const Icon = ICONS[it.id] ?? Languages;
              const on = i === active;
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-pressed={on}
                    className={cn('group relative flex w-full gap-5 overflow-hidden rounded-[1.75rem] border p-6 text-start transition-all duration-500 md:p-7', on ? 'border-brand/20 bg-white shadow-xl shadow-brand/10' : 'border-brand/10 bg-white/60 hover:bg-white')}
                  >
                    <span className={cn('absolute inset-y-6 start-0 w-1 origin-top rounded-e-full bg-gradient-to-b from-gold to-brand transition-transform duration-500', on ? 'scale-y-100' : 'scale-y-0')} aria-hidden />
                    <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl transition-colors duration-500', on ? 'bg-brand text-white' : 'bg-brand-50 text-brand ring-1 ring-brand/10')}>
                      <Icon className="size-5" />
                    </span>
                    <span className="block">
                      <span className="heading-card block">{it.title}</span>
                      <motion.span className="block overflow-hidden" initial={false} animate={{ height: 'auto', opacity: on ? 1 : 0.7 }} transition={{ duration: 0.4, ease: EASE }}>
                        <span className="mt-2 block text-[15px] leading-relaxed text-ink/60">{it.text}</span>
                      </motion.span>
                    </span>
                    {on && !paused && (
                      <span className="absolute inset-x-6 bottom-0 hidden h-0.5 overflow-hidden rounded-full bg-brand/10 lg:block" aria-hidden>
                        <motion.span key={active} className="block h-full origin-left bg-gradient-to-r from-gold to-brand rtl:origin-right" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 5.5, ease: 'linear' }} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
