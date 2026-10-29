'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight, BarChart3, Box, Calculator, CalendarDays, GraduationCap, Smartphone } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { Stagger, StaggerItem } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';

const ICONS = { calculator: Calculator, calendar: CalendarDays, vps: Box, analysis: BarChart3, academy: GraduationCap, app: Smartphone };
const FEATURED = 'vps';

/** Six tools; the Free VPS card is featured on navy. Each card is a link. */
export function Toolkit() {
  const t = useTranslations('openLiveAccountPage.toolkit');
  const items = t.raw('items');

  return (
    <section id="toolkit" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[420px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3" stagger={0.08}>
          {items.map((it, i) => {
            const Icon = ICONS[it.id] ?? Box;
            const featured = it.id === FEATURED;
            return (
              <StaggerItem key={it.id} className="h-full">
                <NavLink href={it.href} className="block h-full">
                  <motion.article
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className={cn('group relative h-full rounded-[2rem] p-[1.5px] shadow-sm transition-shadow duration-500 hover:shadow-2xl', featured ? 'bg-brand shadow-brand/20 hover:shadow-brand/30 lg:-mt-2' : 'bg-brand/10 hover:shadow-brand/15')}
                  >
                    {!featured && <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gold via-brand-200 to-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />}
                    <div className={cn('relative flex h-full flex-col overflow-hidden rounded-[calc(2rem-1.5px)] p-7', featured ? 'is-dark bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white' : 'bg-white')}>
                      {featured && (
                        <>
                          <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-50" aria-hidden />
                          <motion.span className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-[80px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
                        </>
                      )}
                      <span
                        className={cn(
                          'relative grid size-12 place-items-center rounded-2xl ring-1 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110',
                          featured ? 'bg-white text-brand ring-white' : 'bg-brand-50 text-brand ring-brand/10 group-hover:bg-brand group-hover:text-white'
                        )}
                      >
                        <motion.span className="absolute inset-0 rounded-2xl ring-2 ring-gold/40" animate={{ scale: [1, 1.35], opacity: [0.7, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35 }} aria-hidden />
                        <Icon className="size-5" />
                      </span>
                      <h3 className="heading-card relative mt-6">{it.title}</h3>
                      <p className={cn('relative mt-2.5 flex-1 text-[15px] leading-relaxed', featured ? 'text-white/75' : 'text-ink/60')}>{it.text}</p>
                      <span className={cn('relative mt-6 inline-flex items-center gap-2 text-sm font-semibold', featured ? 'text-gold-200' : 'text-brand')}>
                        {it.cta}
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
