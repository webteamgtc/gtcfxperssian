'use client';
/** Help-center hero (dark): badge, title, search, popular topics, floating topic badges and the stats bar. */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { MonitorDown, Search, ShieldCheck, UserPlus, Wallet } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import StatValue from '@/components/shared/StatValue';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Stagger, StaggerItem, EASE } from '@/components/motion';

const BADGES = [
  { key: 'deposits', Icon: Wallet, className: 'start-0 top-[6%] -rotate-6', float: 5 },
  { key: 'openAccount', Icon: UserPlus, className: 'start-[2%] top-[34%] -rotate-3', float: 6 },
  { key: 'mt5Setup', Icon: MonitorDown, className: 'end-0 top-[4%] rotate-3', float: 5.5 },
  { key: 'security', Icon: ShieldCheck, className: 'end-[2%] top-[32%] rotate-6', float: 6.5 }
];

/** Popular topics → a FAQ category (matched by name) or a search. */
export const POPULAR = { deposit: { group: 'deposit' }, openAccount: { group: 'opening' }, mt5: { search: 'MT5' }, verification: { search: 'verification' } };

export default function FaqHeroSection({ onSearch, onTopic }) {
  const t = useTranslations('faqsPage.hero');
  const tb = useTranslations('faqsPage.breadcrumb');
  const [value, setValue] = useState('');
  const stats = t.raw('stats');

  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-20 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="justify-center" items={[{ label: tb('home'), href: '/' }, { label: tb('company'), href: '/company' }, { label: tb('current') }]} />

        <div className="relative mx-auto mt-10 max-w-6xl">
          {BADGES.map(({ key, Icon, className, float }, i) => (
            <motion.div key={key} className={`absolute z-10 hidden xl:block ${className}`} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 200, damping: 16 }} aria-hidden>
              <motion.span className="flex items-center gap-2.5 rounded-2xl bg-white/10 py-2.5 pe-4 ps-2.5 text-sm font-semibold text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-xl" animate={{ y: [0, -8, 0] }} transition={{ duration: float, repeat: Infinity, ease: 'easeInOut' }}>
                <span className="grid size-8 place-items-center rounded-xl bg-gold text-white">
                  <Icon className="size-4" />
                </span>
                {t(`floatingBadges.${key}`)}
              </motion.span>
            </motion.div>
          ))}

          <div className="mx-auto max-w-3xl text-center">
            <motion.span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-200 ring-1 ring-white/10 backdrop-blur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <motion.span className="size-1.5 rounded-full bg-up" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
              {t('badge')}
            </motion.span>
            <motion.h1 className="heading-page mt-6 text-balance" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              <AccentTitle text={t('title')} />
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/65 md:text-lg" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('description')}
            </motion.p>

            <motion.form
              role="search"
              className="mx-auto mt-9 flex max-w-2xl items-center gap-2 rounded-full bg-white p-1.5 shadow-2xl shadow-black/30 ring-1 ring-white/20"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              onSubmit={(e) => {
                e.preventDefault();
                onSearch(value.trim());
              }}
            >
              <Search className="ms-4 size-5 shrink-0 text-brand/50" aria-hidden />
              <input
                type="search"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (!e.target.value) onSearch('');
                }}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchAriaLabel')}
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none md:text-base"
              />
              <button type="submit" className="h-11 shrink-0 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                {t('searchButton')}
              </button>
            </motion.form>

            <motion.div className="mt-6 flex flex-col items-center justify-center gap-3 md:flex-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
              <span className="text-sm font-semibold text-white/70">{t('popularLabel')}</span>
              <ul className="flex flex-wrap justify-center gap-2">
                {Object.keys(POPULAR).map((key) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => {
                        setValue(POPULAR[key].search ?? '');
                        onTopic(key);
                      }}
                      className="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-sm font-medium text-white/85 ring-1 ring-white/15 transition-colors hover:bg-gold hover:text-white hover:ring-gold"
                    >
                      {t(`popularTopics.${key}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <Stagger className="mx-auto mt-12 grid max-w-4xl grid-cols-2 overflow-hidden rounded-[1.75rem] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-xl md:mt-14 md:grid-cols-4" stagger={0.08} delay={0.4}>
            {stats.map((s, i) => (
              <StaggerItem key={s.label} className={`px-4 py-6 text-center md:py-7 ${i % 2 ? '' : 'border-e border-white/10'} ${i < 2 ? 'border-b border-white/10 md:border-b-0' : ''} md:border-e md:last:border-e-0`}>
                <div dir="ltr" className="text-gradient-gold text-3xl font-bold md:text-4xl">
                  <StatValue value={s.value} />
                </div>
                <div className="mt-1.5 text-xs font-medium text-white/55 md:text-sm">{s.label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
