'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Star, Quote, ArrowUpRight } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';

function initials(name) {
  return name
    .replace(/\./g, '')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
}

/** Gray section: three client quotes + links out to the review sites. */
export function Voices() {
  const t = useTranslations('whyGtcGroupPage.voices');
  const items = t.raw('items');
  const links = t.raw('links');
  return (
    <section id="reviews" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />

        <Stagger className="mt-12 grid gap-5 md:mt-14 md:grid-cols-3" stagger={0.12}>
          {items.map((it, i) => (
            <StaggerItem key={it.name} className="h-full">
              <motion.figure
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={cn(
                  'group relative flex h-full flex-col overflow-hidden rounded-[2rem] p-7 shadow-sm transition-shadow duration-500 hover:shadow-2xl md:p-8',
                  i === 1 ? 'is-dark bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 text-white shadow-brand/25' : 'border border-brand/10 bg-white hover:shadow-brand/10'
                )}
              >
                <Quote className={cn('absolute end-6 top-6 size-14 rtl:-scale-x-100', i === 1 ? 'text-white/10' : 'text-brand/[0.07]')} aria-hidden />
                <div className="flex gap-1" role="img" aria-label={t('rating')}>
                  {Array.from({ length: 5 }, (_, k) => (
                    <motion.span key={k} initial={{ scale: 0, rotate: -40 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + k * 0.07, type: 'spring', stiffness: 400, damping: 14 }}>
                      <Star className="size-4 fill-gold text-gold" />
                    </motion.span>
                  ))}
                </div>
                <blockquote className={cn('relative mt-6 flex-1 text-[15px] leading-relaxed md:text-base', i === 1 ? 'text-white/80' : 'text-ink/70')}>“{it.quote}”</blockquote>
                <figcaption className={cn('mt-8 flex items-center gap-3 border-t pt-6', i === 1 ? 'border-white/10' : 'border-brand/10')}>
                  <span dir="ltr" className={cn('grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold', i === 1 ? 'bg-gold text-white' : 'bg-brand-50 text-brand ring-1 ring-brand/10')}>
                    {initials(it.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="heading-small block">
                      <bdi>{it.name}</bdi>
                    </span>
                    <span className={cn('block text-xs', i === 1 ? 'text-white/55' : 'text-ink/50')}>{it.role}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal y={12} delay={0.1} className="mt-10 flex flex-wrap justify-center gap-3">
          {links.map((l) => {
            const cls = 'group inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white px-5 py-2.5 text-sm font-semibold text-brand shadow-sm transition-all duration-300';
            return l.href ? (
              <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" className={cn(cls, 'hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white')}>
                {l.label}
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
              </a>
            ) : (
              // review-site link not supplied yet — shown, but not clickable
              <span key={l.id} aria-disabled="true" className={cn(cls, 'cursor-default opacity-60')}>
                {l.label}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
              </span>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
