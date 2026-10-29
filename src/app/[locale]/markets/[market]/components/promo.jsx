'use client';
/** Template B promo band — navy strip with the market's pitch and its highlight chips. Copy: pages.<id>.promo */
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import BandLine from '@/components/shared/BandLine';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { usePageT } from './shared';

export function PromoBand() {
  const t = usePageT();
  if (!t.has('promo.text')) return null;
  const highlights = t.has('promo.highlights') ? t.raw('promo.highlights') : [];

  return (
    <section className="is-dark relative overflow-hidden bg-gradient-to-r from-brand-950 via-brand-800 to-brand-950 py-14 text-white md:py-20">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-50" aria-hidden />
      {[280, 460, 640].map((s, k) => (
        <motion.span key={s} className="absolute -start-24 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 md:block" style={{ width: s, height: s }} animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 5, delay: k * 0.6, repeat: Infinity }} aria-hidden />
      ))}
      <motion.span className="absolute -end-20 -top-20 size-80 rounded-full bg-gold/20 blur-[100px]" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <BandLine />

      <div className="container-x relative text-center">
        <Reveal y={16}>
          <p className="mx-auto max-w-3xl text-pretty text-lg leading-relaxed text-white/80 md:text-xl">{t('promo.text')}</p>
        </Reveal>
        {highlights.length > 0 && (
          <Stagger className="mt-8 flex flex-wrap justify-center gap-3" stagger={0.1}>
            {highlights.map((h) => (
              <StaggerItem key={h} className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-gold/50">
                <span className="grid size-5 place-items-center rounded-full bg-gold text-white">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {h}
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
