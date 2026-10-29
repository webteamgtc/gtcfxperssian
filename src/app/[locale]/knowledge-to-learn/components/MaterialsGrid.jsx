'use client';
/**
 * Educational materials — bento: the first card is the featured navy tile (its tags drawn as a learning path),
 * the middle four are gradient-ring cards with a cursor spotlight, the last one is a wide strip.
 * Cards with a course page (../courses.js) link to it.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowUpRight, BookOpenText, ChartCandlestick, Layers, MonitorPlay, Radio, ShieldCheck } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import RingCard from '@/components/shared/RingCard';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { SpotlightCard, Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { materialHref } from '../courses';

const ICONS = { videoTutorials: MonitorPlay, ebooksGuides: BookOpenText, webinarsLive: Radio, platformWalkthroughs: ShieldCheck, technicalAnalysis: ChartCandlestick, strategyBlueprints: Layers };
const num = (i) => String(i + 1).padStart(2, '0');

/** Wraps a card in a link when the material has a page. */
function MaybeLink({ href, children, className }) {
  return href ? (
    <NavLink href={href} className={cn('block h-full', className)}>
      {children}
    </NavLink>
  ) : (
    <div className={cn('h-full', className)}>{children}</div>
  );
}

function ArrowDot({ dark }) {
  return (
    <span
      className={cn(
        'grid size-11 shrink-0 place-items-center rounded-full ring-1 transition-all duration-500',
        dark ? 'bg-gold text-white ring-gold group-hover:bg-white group-hover:text-brand-900' : 'bg-white text-brand ring-brand/15 group-hover:bg-brand group-hover:text-white group-hover:ring-brand'
      )}
    >
      <ArrowUpRight className="size-5 transition-transform duration-500 group-hover:rotate-45 rtl:-scale-x-100" />
    </span>
  );
}

/* ------------------------------------------------------------ featured (navy, 2×2) */

/** Decorative video lesson frame: drawn chart line, pulsing play button, running progress bar. */
function LessonPlayer() {
  return (
    <div className="relative mt-8 hidden overflow-hidden rounded-2xl bg-white/[0.05] ring-1 ring-white/10 backdrop-blur sm:block" aria-hidden>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-gold/60" />
      </div>
      <div className="relative h-36 md:h-44">
        <div className="bg-grid-dark absolute inset-0 opacity-60" />
        <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-3/4 w-full">
          <defs>
            <linearGradient id="lp-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#b68756" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#b68756" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path d="M0 95 L40 80 L80 88 L120 62 L160 70 L200 45 L240 55 L280 30 L320 40 L360 18 L400 26 L400 120 L0 120Z" fill="url(#lp-fill)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 1 }} />
          <motion.path d="M0 95 L40 80 L80 88 L120 62 L160 70 L200 45 L240 55 L280 30 L320 40 L360 18 L400 26" fill="none" stroke="#e3c7a7" strokeWidth="2.5" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE, delay: 0.3 }} />
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <motion.span className="absolute size-16 rounded-full bg-gold/30" animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} />
          <span className="relative grid size-14 place-items-center rounded-full bg-gold text-white shadow-xl shadow-gold/40 transition-transform duration-500 group-hover:scale-110">
            <MonitorPlay className="size-6" />
          </span>
        </span>
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-200" animate={{ width: ['8%', '92%'] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
        </div>
        <span className="h-1.5 w-8 rounded-full bg-white/15" />
      </div>
    </div>
  );
}

function FeaturedCard({ card, href, explore }) {
  const Icon = ICONS[card.key] ?? BookOpenText;
  return (
    <MaybeLink href={href}>
      <RingCard as="div" dark lift={6} innerClassName="p-7 md:p-10">
        <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
        <motion.span className="absolute -end-24 -top-24 size-80 rounded-full bg-gold/25 blur-[100px]" animate={{ opacity: [0.45, 0.9, 0.45], scale: [1, 1.1, 1] }} transition={{ duration: 7, repeat: Infinity }} aria-hidden />
        <span dir="ltr" className="pointer-events-none absolute -bottom-8 end-4 text-[10rem] font-bold leading-none text-white/[0.04]" aria-hidden>
          01
        </span>

        <div className="relative flex items-start justify-between gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15 backdrop-blur transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <Icon className="size-7" />
          </span>
          {href && <ArrowDot dark />}
        </div>

        <h3 className="relative mt-8 text-3xl font-bold leading-tight tracking-tight md:text-4xl">{card.title}</h3>
        <p className="relative mt-4 max-w-md text-pretty text-base leading-relaxed text-white/65">{card.description}</p>

        <LessonPlayer />

        {/* tags as a learning path: Beginner → Intermediate → Advanced */}
        <ol className="relative mt-auto pt-8">
          <motion.span
            className="absolute start-[0.6875rem] top-12 bottom-3 w-px origin-top bg-gradient-to-b from-gold via-gold/50 to-white/10"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
            aria-hidden
          />
          {card.tags.map((tag, i) => (
            <motion.li
              key={tag}
              className="relative flex items-center gap-4 py-2"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.4 + i * 0.18 }}
            >
              <span className={cn('relative grid size-6 shrink-0 place-items-center rounded-full ring-4 ring-brand-900', i === 0 ? 'bg-gold' : 'bg-white/15')}>
                <span className={cn('size-2 rounded-full', i === 0 ? 'bg-white' : 'bg-gold-200')} />
              </span>
              <span className="text-sm font-semibold text-white/85">{tag}</span>
            </motion.li>
          ))}
        </ol>

        {href && (
          <span className="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold-200">
            {explore}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
          </span>
        )}
      </RingCard>
    </MaybeLink>
  );
}

/* ------------------------------------------------------------ standard card */

function MaterialCard({ card, index, href }) {
  const Icon = ICONS[card.key] ?? BookOpenText;
  return (
    <MaybeLink href={href}>
      <RingCard as="div" lift={6}>
        <SpotlightCard className="flex h-full flex-col p-6 md:p-7" color="rgba(41,59,147,0.08)" size={320}>
          <span dir="ltr" className="pointer-events-none absolute end-5 top-4 text-6xl font-bold leading-none text-brand/[0.05] transition-colors duration-500 group-hover:text-gold/15" aria-hidden>
            {num(index)}
          </span>
          <div className="relative flex items-start justify-between gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-900 text-white shadow-lg shadow-brand/25 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
              <Icon className="size-5" />
            </span>
          </div>
          <h3 className="heading-card relative mt-6">{card.title}</h3>
          <p className="relative mt-2.5 flex-1 text-pretty text-sm leading-relaxed text-ink/60">{card.description}</p>
          <div className="relative mt-6 flex items-end justify-between gap-3">
            <ul className="flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand transition-colors duration-500 group-hover:bg-gold-50 group-hover:text-gold-700">
                  {tag}
                </li>
              ))}
            </ul>
            {href && <ArrowDot />}
          </div>
        </SpotlightCard>
      </RingCard>
    </MaybeLink>
  );
}

/* ------------------------------------------------------------ wide strip */

function WideCard({ card, index, href }) {
  const Icon = ICONS[card.key] ?? BookOpenText;
  return (
    <MaybeLink href={href}>
      <RingCard as="div" lift={4} innerClassName="bg-gradient-to-r from-gold-50 via-white to-brand-50">
        <div className="relative grid items-center gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:gap-8 md:p-8">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-700 text-white shadow-lg shadow-gold/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
              <Icon className="size-6" />
            </span>
            <span dir="ltr" className="text-xs font-bold tracking-[0.2em] text-gold-600 md:hidden">
              {num(index)}
            </span>
          </div>
          <div>
            <h3 className="heading-card">{card.title}</h3>
            <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-ink/60">{card.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <ul className="flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gold-700 ring-1 ring-gold/25">
                  {tag}
                </li>
              ))}
            </ul>
            {href && <ArrowDot />}
          </div>
        </div>
      </RingCard>
    </MaybeLink>
  );
}

/** Six material cards in a bento grid; the ones with a course page link to it. */
export function MaterialsGrid() {
  const t = useTranslations('knowledgePage.educationalMaterials');
  const cards = t.raw('cards');
  const [first, ...rest] = cards;
  const last = rest.length > 4 ? rest.pop() : null;

  return (
    <section id="materials" className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="absolute -end-40 top-10 size-[460px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="absolute -start-40 bottom-0 size-[400px] rounded-full bg-gold/[0.08] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('subtitle')} />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-4" stagger={0.08}>
          {first && (
            <StaggerItem className="sm:col-span-2 lg:row-span-2">
              <FeaturedCard card={first} href={materialHref(first.key)} explore={t('explore')} />
            </StaggerItem>
          )}
          {rest.map((card, i) => (
            <StaggerItem key={card.key} className="h-full">
              <MaterialCard card={card} index={i + 1} href={materialHref(card.key)} />
            </StaggerItem>
          ))}
          {last && (
            <StaggerItem className="sm:col-span-2 lg:col-span-4">
              <WideCard card={last} index={cards.length - 1} href={materialHref(last.key)} />
            </StaggerItem>
          )}
        </Stagger>
      </div>
    </section>
  );
}
