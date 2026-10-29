'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowLeftRight, Bitcoin, Building, CreditCard, Globe, Landmark, RefreshCw, TrendingUp, Wallet, Zap } from 'lucide-react';
import { Stagger, StaggerItem } from '@/components/motion';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { cn } from '@/lib/utils';

/** Light card with the hover gradient ring used across the page. */
function Card({ children, className, dark = false }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn('group relative h-full rounded-[2rem] p-[1.5px] shadow-sm transition-shadow duration-500 hover:shadow-2xl', dark ? 'bg-brand hover:shadow-brand/30' : 'bg-brand/10 hover:shadow-brand/15', className)}
    >
      {!dark && <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-gold via-brand-200 to-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />}
      <div className={cn('relative flex h-full flex-col overflow-hidden rounded-[calc(2rem-1.5px)] p-7', dark ? 'is-dark bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white' : 'bg-white')}>{children}</div>
    </motion.article>
  );
}

function Chip({ Icon, dark = false }) {
  return (
    <span className={cn('grid size-12 place-items-center rounded-2xl ring-1 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110', dark ? 'bg-white/10 text-white ring-white/20' : 'bg-brand-50 text-brand ring-brand/10 group-hover:bg-brand group-hover:text-white')}>
      <Icon className="size-5" />
    </span>
  );
}

/** Wavy order-book line that draws itself in. */
function LiquidityLine() {
  return (
    <svg viewBox="0 0 300 50" className="mt-6 h-12 w-full" preserveAspectRatio="none" aria-hidden>
      <motion.path d="M5 40 C 50 36, 80 42, 120 32 S 180 18, 220 24 S 270 10, 295 8" fill="none" stroke="#293b93" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: 'easeInOut' }} />
      <motion.circle r="4" fill="#b68756" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2 }} cx="295" cy="8" />
    </svg>
  );
}

/** Payment method chips sliding past on a loop. */
function PaymentRail() {
  const icons = [CreditCard, Landmark, Bitcoin, Wallet, Building, ArrowLeftRight];
  const loop = [...icons, ...icons];
  return (
    <div dir="ltr" className="relative mt-7 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]" aria-hidden>
      <motion.div className="flex w-max gap-3" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}>
        {loop.map((Icon, i) => (
          <span key={i} className="grid size-11 place-items-center rounded-xl bg-white/10 text-gold-200 ring-1 ring-white/15">
            <Icon className="size-5" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function WhyGtcfx() {
  const t = useTranslations('openLiveAccountPage.why');
  const langs = t.raw('support.languages');

  return (
    <section id="why" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2" stagger={0.1}>
          {/* spreads */}
          <StaggerItem className="h-full">
            <Card>
              <Chip Icon={RefreshCw} />
              <h3 className="heading-card mt-6">{t('spreads.title')}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink/60">{t('spreads.text')}</p>
              <div className="mt-6 flex items-baseline gap-2" dir="ltr">
                <span className="heading-accent text-4xl font-bold">{t('spreads.value')}</span>
                <span className="text-sm text-ink/50">{t('spreads.unit')}</span>
              </div>
            </Card>
          </StaggerItem>

          {/* execution */}
          <StaggerItem className="h-full">
            <Card>
              <Chip Icon={Zap} />
              <h3 className="heading-card mt-6">{t('execution.title')}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink/60">{t('execution.text')}</p>
              <div className="mt-6 flex items-center gap-4" dir="ltr">
                <span className="flex items-baseline gap-2">
                  <span className="heading-accent text-4xl font-bold">{t('execution.value')}</span>
                  <span className="text-sm text-ink/50">{t('execution.unit')}</span>
                </span>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-brand/10" aria-hidden>
                  <motion.span className="absolute inset-y-0 start-0 w-1/3 rounded-full bg-gradient-to-r from-gold to-brand" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }} />
                </span>
              </div>
            </Card>
          </StaggerItem>

          {/* liquidity */}
          <StaggerItem className="h-full">
            <Card>
              <Chip Icon={TrendingUp} />
              <h3 className="heading-card mt-6">{t('liquidity.title')}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink/60">{t('liquidity.text')}</p>
              <LiquidityLine />
            </Card>
          </StaggerItem>

          {/* deposits (featured) */}
          <StaggerItem className="h-full">
            <Card dark>
              <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-50" aria-hidden />
              <motion.span className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-[80px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
              <div className="relative">
                <Chip Icon={Wallet} dark />
                <h3 className="heading-card mt-6">{t('deposits.title')}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-white/75">{t('deposits.text')}</p>
                <PaymentRail />
              </div>
            </Card>
          </StaggerItem>

          {/* support (wide) */}
          <StaggerItem className="h-full md:col-span-2">
            <Card>
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10">
                  <motion.span className="absolute inset-0 rounded-2xl ring-2 ring-gold/50" animate={{ scale: [1, 1.4], opacity: [0.8, 0] }} transition={{ duration: 2.2, repeat: Infinity }} aria-hidden />
                  <Globe className="size-5" />
                </span>
                <div className="flex-1">
                  <h3 className="heading-card">{t('support.title')}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink/60">{t('support.text')}</p>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {langs.map((l, i) => (
                    <motion.li key={l} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-900 ring-1 ring-brand/10" animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}>
                      {l}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Card>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
