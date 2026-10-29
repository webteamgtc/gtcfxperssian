'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Check, CircleCheck, History, Zap } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop, { LightHeroBackdrop } from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { DemoAccountForm } from '@/components/shared/MainIBForm';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const HIGHLIGHT_ICONS = [CircleCheck, Zap, History];

/**
 * Free demo hero: copy + pills + trust row on the start side, the demo form on the end side.
 * tone 'dark' (default, same look as the open-live-account hero) or 'light'.
 */
export function DemoHero({ tone = 'dark' }) {
  const t = useTranslations('freeDemoAccount.hero');
  const tb = useTranslations('freeDemoAccount.breadcrumb');
  const points = t.raw('points');
  const highlights = t.raw('highlights');
  const light = tone === 'light';

  return (
    <section className={cn('relative overflow-hidden pb-20 pt-36 md:pb-28 md:pt-44', light ? 'text-ink' : 'is-dark bg-ink text-white')}>
      {light ? <LightHeroBackdrop /> : <HeroBackdrop />}

      <div className="container-x relative">
        <Breadcrumb
          tone={tone}
          className="lg:justify-start"
          items={[
            { label: tb('home'), href: '/' },
            { label: tb('trading'), href: '/trading' },
            { label: tb('current') }
          ]}
        />

        <div className="mt-10 grid items-center gap-14 lg:grid-cols-[1.05fr_minmax(0,520px)] lg:gap-14">
          {/* copy */}
          <div className="text-center lg:text-start">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={cn('inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur', light ? 'border border-brand/10 bg-white text-brand shadow-sm' : 'border-beam bg-white/5 text-gold-200')}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-up" />
              </span>
              {t('badge')}
            </motion.span>

            <motion.h1 className={cn('heading-page mt-6 max-w-2xl lg:max-w-none', light && 'text-ink')} initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className={cn('mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed md:text-lg lg:mx-0', light ? 'text-ink/60' : 'text-white/65')} initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('text')}
            </motion.p>

            {/* points as pills */}
            <motion.ul className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } } }}>
              {points.map((p) => (
                <motion.li
                  key={p}
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -2 }}
                  className={cn('inline-flex items-center gap-2 rounded-full border py-2 pe-4 ps-2 text-sm font-semibold backdrop-blur', light ? 'border-brand/10 bg-white text-brand-900 shadow-sm' : 'border-white/10 bg-white/5 text-white')}
                >
                  <span className={cn('grid size-5 place-items-center rounded-full', light ? 'bg-brand text-white' : 'bg-gold/20 text-gold-200')}>
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {p}
                </motion.li>
              ))}
            </motion.ul>

            {/* highlights as the trust row */}
            <motion.ul className={cn('mt-10 flex flex-wrap justify-center gap-x-7 gap-y-3 border-t pt-6 lg:justify-start', light ? 'border-brand/10' : 'border-white/10')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              {highlights.map((h, i) => {
                const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length];
                return (
                  <li key={h} className={cn('inline-flex items-center gap-2 text-sm font-medium', light ? 'text-ink/70' : 'text-white/75')}>
                    <Icon className={cn('size-4', light ? 'text-gold-700' : 'text-gold-200')} strokeWidth={1.75} />
                    {h}
                  </li>
                );
              })}
            </motion.ul>
          </div>

          {/* form, with a soft glow behind it */}
          <motion.div className="relative" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.85, ease: EASE }}>
            <div className={cn('absolute -inset-6 rounded-[2.5rem] blur-3xl', light ? 'bg-gradient-to-br from-brand/20 via-gold/15 to-transparent' : 'bg-brand/30')} aria-hidden />
            <DemoAccountForm className={cn('relative', light && 'border-brand/10 shadow-[0_40px_100px_-40px_rgba(41,59,147,0.45)]')} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
