'use client';
import { createContext, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal, WordReveal, EASE } from '../motion';

export const HeadingStyle = createContext('pill');

/**
 * Section heading. The visual style comes from <HeadingStyle.Provider value="pill|index|split">
 *  pill  – centered, eyebrow pill (Draft 1)
 *  index – left aligned, gold index number + drawn line (Draft 2)
 *  split – title left, subtitle right with a growing divider (Draft 3)
 */
export function SectionHeading({ eyebrow, title, titleB, subtitle, dark = false, align = 'center', index, className }) {
  const style = useContext(HeadingStyle);
  // size, weight, colour and gradient come from .heading-section / .heading-accent in globals.css
  const h2 = cn('heading-section', dark && 'is-dark');
  const sub = cn('text-pretty text-[15px] leading-relaxed md:text-base', dark ? 'text-white/60' : 'text-ink/60');
  const gradient = 'heading-accent';
  const Title = (
    <>
      <WordReveal text={title} />
      {titleB && (
        <>
          <br className="hidden md:block" />{' '}
          <WordReveal text={titleB} delay={0.15} wordClassName={gradient} />
        </>
      )}
    </>
  );

  if (style === 'index') {
    return (
      <div className={cn('max-w-3xl', className)}>
        {(index || eyebrow) && (
        <div className="flex items-center gap-4">
          {index && (
            <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-mono text-sm font-semibold tabular-nums text-gold">
              {String(index).padStart(2, '0')}
            </motion.span>
          )}
          <motion.span className="h-px w-20 origin-left bg-gradient-to-r from-gold to-transparent rtl:origin-right" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} />
          {eyebrow && (
            <Reveal y={0} x={-10} blur={0} delay={0.3}>
              <span className={cn('text-xs font-semibold uppercase tracking-[0.22em]', dark ? 'text-white/60' : 'text-ink/50')}>{eyebrow}</span>
            </Reveal>
          )}
        </div>
        )}
        <h2 className={cn(h2, (index || eyebrow) && 'mt-5')}>{Title}</h2>
        {subtitle && (
          <Reveal delay={0.2} y={16}>
            <p className={cn(sub, 'mt-4 max-w-xl')}>{subtitle}</p>
          </Reveal>
        )}
      </div>
    );
  }

  if (style === 'split') {
    return (
      <div className={cn('grid items-end gap-6', align !== 'start' && 'md:grid-cols-[1.2fr_1fr] md:gap-12', className)}>
        <div>
          {eyebrow && (
            <Reveal y={10} blur={0}>
              <span className={cn('inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]', dark ? 'text-gold-200' : 'text-gold-700')}>
                <motion.span className="size-2 rounded-sm bg-gold" animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
                {eyebrow}
              </span>
            </Reveal>
          )}
          <h2 className={cn(h2, eyebrow && 'mt-4')}>{Title}</h2>
        </div>
        {subtitle && (
          <div className="relative ps-6">
            <motion.span className={cn('absolute start-0 top-0 h-full w-px origin-top', dark ? 'bg-white/20' : 'bg-brand/20')} initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} />
            <Reveal delay={0.25} y={12}>
              <p className={sub}>{subtitle}</p>
            </Reveal>
          </div>
        )}
      </div>
    );
  }

  // pill (default)
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl', className)}>
      {eyebrow && (
        <Reveal y={12} blur={0}>
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
              dark ? 'border-gold/30 bg-gold/10 text-gold-200' : 'border-gold/30 bg-gold-50 text-gold-700'
            )}
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-gold" />
            </span>
            {eyebrow}
          </span>
        </Reveal>
      )}
      <h2 className={cn(h2, eyebrow && 'mt-5')}>{Title}</h2>
      {subtitle && (
        <Reveal delay={0.2} y={16}>
          <p className={cn(sub, 'mt-4', align === 'center' && 'mx-auto max-w-2xl')}>{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Slow drifting blurred blobs for section backgrounds */
export function Ambient({ tone = 'light', className }) {
  const a = tone === 'dark' ? 'bg-brand/35' : 'bg-brand-200/45';
  const b = tone === 'dark' ? 'bg-gold/20' : 'bg-gold-200/45';
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <motion.div className={cn('absolute -start-32 top-10 size-[420px] rounded-full blur-[110px]', a)} animate={{ x: [0, 80, 0], y: [0, 50, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className={cn('absolute -end-24 bottom-0 size-[360px] rounded-full blur-[110px]', b)} animate={{ x: [0, -70, 0], y: [0, -40, 0] }} transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }} />
    </div>
  );
}

/** Placeholder portrait until real CEO / GM photos are supplied */
export function Portrait({ initials, className, dark = false, tone = 'brand' }) {
  const t = useTranslations('leaders');
  return (
    <div
      className={cn(
        'relative flex h-full w-full items-end justify-center overflow-hidden',
        tone === 'gold' ? 'bg-gradient-to-b from-gold-200 via-gold to-gold-700' : 'bg-gradient-to-b from-brand-400 via-brand to-brand-950',
        className
      )}
    >
      <div className="bg-dots-dark absolute inset-0 opacity-40" />
      <motion.div
        className="absolute inset-x-0 top-1/2 mx-auto size-56 -translate-y-1/2 rounded-full bg-white/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <UserRound className="relative size-[78%] translate-y-[12%] text-white/25" strokeWidth={1} />
      <span className="absolute start-5 top-5 rounded-full bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur">
        {t('placeholder')} · {initials}
      </span>
    </div>
  );
}

/* The lead / registration form lives in ./CommonLeadForm.jsx */

/** 4-step onboarding line that draws itself */
export function Steps({ dark = false }) {
  const t = useTranslations('register');
  const steps = t.raw('steps');
  return (
    <div className="relative mt-10 grid grid-cols-4 gap-2">
      <div className={cn('absolute inset-x-[12%] top-5 h-px', dark ? 'bg-white/10' : 'bg-brand/10')} />
      <motion.div
        className="absolute start-[12%] top-5 h-px bg-gradient-to-r from-gold to-brand-300"
        initial={{ width: 0 }}
        whileInView={{ width: '76%' }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
      />
      {steps.map((s, i) => (
        <motion.div
          key={s}
          className="relative flex flex-col items-center gap-3 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.4 }}
        >
          <span className={cn('grid size-10 place-items-center rounded-full border text-sm font-bold', dark ? 'border-gold/40 bg-ink text-gold' : 'border-brand/20 bg-white text-brand')}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className={cn('text-sm font-medium', dark ? 'text-white/70' : 'text-ink/70')}>{s}</span>
        </motion.div>
      ))}
    </div>
  );
}
