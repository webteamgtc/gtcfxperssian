'use client';
/** Template B FAQ (the dark band before the CTA) Copy: pages.<id>.faq. FAQPage JSON-LD is added by the route. */
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircleQuestion } from 'lucide-react';
import BandLine from '@/components/shared/BandLine';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { usePageT } from './shared';

function Band({ children }) {
  return (
    <section className="is-dark relative overflow-hidden bg-ink py-14 text-white md:py-24">
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-50" aria-hidden />
      <span className="absolute -end-40 top-10 size-[420px] rounded-full bg-brand/30 blur-[120px]" aria-hidden />
      <BandLine />
      <div className="container-x relative">{children}</div>
    </section>
  );
}

/** Split — questions on the start side, the selected answer in a large panel on the other. */
export function FaqSplit() {
  const t = usePageT();
  const items = t.raw('faq.items');
  const [i, setI] = useState(0);
  return (
    <Band>
      <SectionIntro dark layout="split" title={t('faq.title')} description={t('faq.description')} />
      <div className="mt-12 grid gap-6 md:mt-16 lg:grid-cols-[1fr_1.1fr]">
        <div role="tablist" aria-orientation="vertical" aria-label={t('faq.title').replace(/[[\]]/g, '')} className="space-y-2">
          {items.map((x, k) => (
            <button key={x.q} id={`faq-t${k}`} type="button" role="tab" aria-selected={k === i} aria-controls="faq-panel" onClick={() => setI(k)} className={cn('relative flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-start text-[15px] font-semibold transition-colors', k === i ? 'text-brand-900' : 'text-white/75 hover:bg-white/[0.05] hover:text-white')}>
              {k === i && <motion.span layoutId="faq-tab" className="absolute inset-0 rounded-2xl bg-white" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="relative">{x.q}</span>
            </button>
          ))}
        </div>
        <div id="faq-panel" role="tabpanel" aria-labelledby={`faq-t${i}`} className="relative min-h-[260px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-900/80 to-brand/40 p-8 md:p-10">
          <MessageCircleQuestion className="absolute -bottom-6 -end-6 size-40 text-white/[0.04]" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: EASE }} className="relative">
              <h3 className="heading-card">{items[i].q}</h3>
              <p className="mt-4 text-base leading-relaxed text-white/70">{items[i].a}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Band>
  );
}
