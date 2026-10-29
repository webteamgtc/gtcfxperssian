'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem } from '@/components/motion';

/* small line-art visuals, one per card */
function Target() {
  return (
    <svg viewBox="-60 -60 120 120" className="size-28" aria-hidden>
      {[48, 34, 20].map((r, i) => (
        <motion.circle key={r} r={r} fill="none" stroke="#293b93" strokeOpacity={0.25 + i * 0.2} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }} />
      ))}
      <circle r="8" fill="#293b93" />
      <motion.circle r="8" fill="#b68756" animate={{ r: [8, 26], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity }} />
    </svg>
  );
}
function GlobeMini() {
  return (
    <svg viewBox="-60 -60 120 120" className="size-28" aria-hidden>
      <circle r="46" fill="none" stroke="#293b93" strokeOpacity="0.5" />
      <ellipse rx="46" ry="16" fill="none" stroke="#293b93" strokeOpacity="0.3" />
      <motion.ellipse ry="46" fill="none" stroke="#293b93" strokeOpacity="0.35" initial={{ rx: 46 }} animate={{ rx: [46, 4, 46] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
      <motion.ellipse ry="46" fill="none" stroke="#293b93" strokeOpacity="0.35" initial={{ rx: 20 }} animate={{ rx: [20, 46, 4, 20] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
      {[[-22, -18], [26, -12], [-12, 22], [30, 16]].map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="3" fill="#b68756" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }} />
      ))}
    </svg>
  );
}
function Stand() {
  return (
    <svg viewBox="-60 -60 120 120" className="size-28" aria-hidden>
      <motion.path d="M0 -44 L-30 18 L30 18 Z" fill="none" stroke="#293b93" strokeOpacity="0.6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
      <path d="M0 -24 L-16 12 L16 12 Z" fill="none" stroke="#293b93" strokeOpacity="0.3" />
      <rect x="-8" y="18" width="16" height="14" fill="none" stroke="#293b93" strokeOpacity="0.5" />
      <line x1="-46" x2="46" y1="32" y2="32" stroke="#293b93" strokeOpacity="0.4" />
      <motion.circle cx="0" cy="-44" r="4" fill="#b68756" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
    </svg>
  );
}
const VISUALS = { why: Target, global: GlobeMini, events: Stand };

export function Explore() {
  const t = useTranslations('aboutUsPage.explore');
  const items = t.raw('items');
  return (
    <section id="explore" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <Stagger className="mt-12 grid gap-5 md:mt-14 md:grid-cols-3" stagger={0.1}>
          {items.map((it) => {
            const Visual = VISUALS[it.id] ?? Target;
            return (
              <StaggerItem key={it.id} className="h-full">
                <NavLink href={it.href} className="group block h-full">
                  <motion.article whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-brand/10 bg-white shadow-sm transition-shadow duration-500 group-hover:border-brand/25 group-hover:shadow-2xl group-hover:shadow-brand/10">
                    <div className="relative grid h-52 place-items-center overflow-hidden bg-gradient-to-br from-[#f3f5fb] to-[#eaedf6]">
                      <div className="bg-dots-light absolute inset-0 opacity-70" aria-hidden />
                      <div className="relative transition-transform duration-700 group-hover:scale-110">
                        <Visual />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-7">
                      <h3 className="heading-card">{it.title}</h3>
                      <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-ink/60">{it.text}</p>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                        {t('more')}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                      </span>
                    </div>
                  </motion.article>
                </NavLink>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
