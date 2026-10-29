'use client';
/**
 * /thank-you — shown after a form is sent (lead, demo, contact, delete request…).
 * ?message=true adds the "check your email" notice. UI copy: messages/<lang>/thankYouPage.json.
 * Rhythm: dark hero (self-drawing success mark + confetti, copy, actions, "what happens next" timeline)
 * → gray ("while you wait" links) → dark footer.
 */
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowUpRight, CalendarDays, Check, Globe, Mail, MonitorSmartphone, Sparkles } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import ArrowLink from '@/components/shared/ArrowLink';
import NavLink from '@/components/shared/nav/NavLink';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, ScrollProgress, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';

const EXPLORE = [
  { key: 'markets', href: '/markets', Icon: Globe },
  { key: 'platform', href: '/trading/mt5-platform', Icon: MonitorSmartphone },
  { key: 'calendar', href: '/gtc-news/economic-calendar', Icon: CalendarDays }
];

// confetti pieces: angle (deg), distance (px), colour, size — fixed so server and client render the same
const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  angle: (360 / 22) * i + (i % 2 ? 6 : -6),
  dist: 110 + ((i * 37) % 70),
  color: ['#b68756', '#e3c7a7', '#5565bd', '#ffffff', '#16a34a'][i % 5],
  size: 5 + (i % 3) * 2,
  round: i % 3 === 0
}));

/** The success mark: rings pulse out, the circle and tick draw themselves, then confetti bursts. */
function SuccessMark() {
  return (
    <div dir="ltr" className="relative mx-auto grid size-40 place-items-center" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="absolute inset-0 rounded-full border border-gold/30" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: [0.8, 1.8], opacity: [0.6, 0] }} transition={{ delay: 1 + i * 0.8, duration: 2.4, repeat: Infinity, ease: 'easeOut' }} />
      ))}
      <motion.span className="absolute inset-6 rounded-full bg-gold/30 blur-2xl" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />

      {CONFETTI.map((c, i) => {
        const rad = (c.angle * Math.PI) / 180;
        return (
          <motion.span
            key={i}
            className={cn('absolute left-1/2 top-1/2', c.round ? 'rounded-full' : 'rounded-[2px]')}
            style={{ width: c.size, height: c.round ? c.size : c.size * 1.8, background: c.color, marginLeft: -c.size / 2, marginTop: -c.size / 2 }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
            animate={{ x: Math.cos(rad) * c.dist, y: Math.sin(rad) * c.dist + 40, opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0.6], rotate: c.angle * 2 }}
            transition={{ delay: 1.15, duration: 1.6, ease: [0.2, 0.8, 0.4, 1], times: [0, 0.15, 0.7, 1] }}
          />
        );
      })}

      <motion.div className="relative grid size-28 place-items-center rounded-full bg-gradient-to-br from-gold-300 via-gold to-gold-700 shadow-[0_20px_60px_-10px_rgba(182,135,86,0.7)]" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.2 }}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
          <motion.circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.8, ease: 'easeInOut' }} />
        </svg>
        <svg viewBox="0 0 52 52" className="size-14">
          <motion.path d="M14 27 L23 36 L39 18" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.85, duration: 0.45, ease: 'easeOut' }} />
        </svg>
      </motion.div>
    </div>
  );
}

/** "Check your email" notice with a little envelope that bobs and opens. */
function EmailNotice() {
  const t = useTranslations('thankYouPage');
  return (
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 1.2, duration: 0.6, ease: EASE }} className="relative mx-auto mt-8 flex max-w-xl items-center gap-4 overflow-hidden rounded-2xl bg-white/[0.07] p-4 text-start ring-1 ring-white/15 backdrop-blur-xl md:p-5">
      <motion.span className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" animate={{ left: ['-40%', '140%'] }} transition={{ delay: 1.8, duration: 2.2, repeat: Infinity, repeatDelay: 3 }} aria-hidden />
      <motion.span className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-lg shadow-brand/40" animate={{ y: [0, -4, 0], rotate: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
        <Mail className="size-5" />
        <span className="absolute -end-1 -top-1 grid size-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-white ring-2 ring-ink">1</span>
      </motion.span>
      <div className="relative min-w-0">
        <p className="text-sm font-semibold leading-relaxed text-white md:text-[15px]">{t('checkEmail')}</p>
        <p className="mt-1 text-xs text-white/50">{t('checkEmailHint')}</p>
      </div>
    </motion.div>
  );
}

/** Three steps on a line that draws itself: done → in progress → next. */
function NextSteps() {
  const t = useTranslations('thankYouPage.next');
  const steps = t.raw('steps');
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.7, ease: EASE }} className="mx-auto mt-14 max-w-3xl rounded-[1.75rem] bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur md:p-8">
      <h2 className="heading-small text-center text-white">
        <AccentTitle text={t('title')} />
      </h2>
      <ol className="relative mt-8 grid gap-6 sm:grid-cols-3 sm:gap-4">
        {/* connector (desktop) */}
        <span className="absolute inset-x-[16.6%] top-5 hidden h-0.5 bg-white/10 sm:block" aria-hidden>
          <motion.span className="block h-full origin-left bg-gradient-to-r from-up via-gold to-gold/30 rtl:origin-right" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.9, duration: 1.2, ease: EASE }} />
        </span>
        {steps.map((s, i) => {
          const done = i === 0;
          const current = i === 1;
          return (
            <motion.li key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 + i * 0.25, duration: 0.5, ease: EASE }} className="relative flex items-start gap-4 text-start sm:flex-col sm:items-center sm:text-center">
              <span className={cn('relative z-10 grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ring-4 ring-ink', done ? 'bg-up text-white' : current ? 'bg-gold text-white' : 'bg-white/10 text-white/60')}>
                {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                {current && <motion.span className="absolute inset-0 rounded-full ring-2 ring-gold" animate={{ scale: [1, 1.6], opacity: [0.8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />}
              </span>
              <span>
                <span className={cn('block text-sm font-bold', done || current ? 'text-white' : 'text-white/70')}>{s.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-white/50">{s.text}</span>
              </span>
            </motion.li>
          );
        })}
      </ol>
    </motion.div>
  );
}

function Hero() {
  const t = useTranslations('thankYouPage');
  const showEmail = useSearchParams().get('message') === 'true';
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-20 pt-36 text-white md:pb-28 md:pt-44">
      <HeroBackdrop />
      {/* slow floating sparkles */}
      {[
        'start-[12%] top-[30%]',
        'end-[14%] top-[24%]',
        'start-[20%] bottom-[22%]',
        'end-[18%] bottom-[30%]'
      ].map((pos, i) => (
        <motion.span key={pos} className={cn('pointer-events-none absolute text-gold-200/40 max-md:hidden', pos)} animate={{ y: [0, -14, 0], rotate: [0, 20, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }} aria-hidden>
          <Sparkles className={i % 2 ? 'size-5' : 'size-7'} />
        </motion.span>
      ))}

      <div className="container-x relative text-center">
        <SuccessMark />
        <motion.span className="mt-8 inline-flex items-center gap-2 rounded-full bg-up/15 px-4 py-1.5 text-xs font-bold tracking-wide text-green-200 ring-1 ring-up/30 backdrop-blur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}>
          <motion.span className="size-1.5 rounded-full bg-green-300" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
          {t('badge')}
        </motion.span>
        <motion.h1 className="heading-page mt-5" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.95, duration: 0.75, ease: EASE }}>
          <AccentTitle text={t('heading')} />
        </motion.h1>
        <motion.p className="mx-auto mt-4 max-w-xl text-pretty text-lg font-semibold text-white/85 md:text-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.6 }}>
          {t('heading1')}
        </motion.p>

        {showEmail && <EmailNotice />}

        <motion.div className="mx-auto mt-6 max-w-xl space-y-1.5 text-[15px] leading-relaxed text-white/60 md:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.25, duration: 0.6 }}>
          <p>{t('des')}</p>
          <p>{t('des1')}</p>
        </motion.div>

        <motion.div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35, duration: 0.6, ease: EASE }}>
          <ArrowLink href="/" variant="gold">
            {t('actions.home')}
          </ArrowLink>
          <NavLink href="/company/contact-us" className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-900">
            {t('actions.support')}
          </NavLink>
        </motion.div>

        <NextSteps />
      </div>
    </section>
  );
}

function Explore() {
  const t = useTranslations('thankYouPage');
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative mx-auto max-w-5xl">
        <Reveal y={16} className="text-center">
          <h2 className="heading-label">{t('explore.title')}</h2>
        </Reveal>
        <Stagger className="mt-6 grid gap-4 sm:grid-cols-3" stagger={0.08}>
          {EXPLORE.map(({ key, href, Icon }) => (
            <StaggerItem key={key} className="h-full">
              <NavLink href={href} className="group relative flex h-full items-center gap-4 overflow-hidden rounded-[1.5rem] bg-white p-5 shadow-lg shadow-brand/5 ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/15 hover:ring-brand/25">
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand via-brand-400 to-gold transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" aria-hidden />
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-ink transition-colors group-hover:text-brand">{t(`explore.items.${key}.title`)}</span>
                  <span className="mt-0.5 block text-sm text-ink/55">{t(`explore.items.${key}.text`)}</span>
                </span>
                <ArrowUpRight className="size-5 shrink-0 text-brand/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand rtl:-scale-x-100" />
              </NavLink>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal y={12} delay={0.15} className="mt-12 text-center">
          <p className="text-lg font-bold text-ink">{t('footer')}</p>
          <p className="mt-1 text-sm text-ink/55">{t('footer1')}</p>
        </Reveal>
      </div>
    </section>
  );
}

export default function ThankYouPage() {
  return (
    <div className="overflow-x-clip bg-[#f6f7fb] text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <Hero />
        <Explore />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
