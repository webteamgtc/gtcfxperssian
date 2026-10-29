'use client';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import ArrowLink from '@/components/shared/ArrowLink';
import { Reveal, EASE } from '@/components/motion';
import { AU, MU, ZA, VU, KH } from 'country-flag-icons/react/3x2';
import { cn } from '@/lib/utils';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { useScrollSteps } from '@/components/shared/useScrollSteps';

const AUTO_MS = 6500;

const ENTITIES = [
  { id: 'australia', Flag: AU },
  { id: 'mauritius', Flag: MU },
  { id: 'southAfrica', Flag: ZA },
  { id: 'vanuatu', Flag: VU },
  { id: 'cambodia', Flag: KH }
];

/**
 * Legal Information: flag tabs + a spotlight card that slides in the direction you move.
 * Desktop: the jurisdiction follows the scroll as the section passes (no pinning, no extra height).
 * Phones: auto-advances.
 */
export function Legal() {
  const t = useTranslations('companyPage.legalSection');
  const s = useScrollSteps(ENTITIES.length, { autoMs: AUTO_MS, start: 0 });
  const i = s.index;
  const dir = s.dir;

  const { id, Flag } = ENTITIES[i];

  return (
    <section id="legal" ref={s.outerRef} className="relative scroll-mt-24 bg-white text-ink">
      <div className="relative overflow-hidden py-14 md:py-20">
      <div className="container-x relative w-full">
        <SectionIntro layout="split" title={t('title')} sub={t('subtitle')} description={t('description')} />

        <div className="mt-10" {...s.hover}>
          {/* tabs */}
          <div>
            <div role="tablist" aria-label={t('subtitle')} className="grid grid-cols-5 gap-1.5 sm:gap-2 rounded-2xl border border-brand/10 bg-[#f3f5fa] p-1.5">
              {ENTITIES.map((e, k) => {
                const on = k === i;
                return (
                  <button
                    key={e.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="legal-panel"
                    aria-label={t(`entities.${e.id}.name`)}
                    onClick={() => s.goTo(k)}
                    className={cn('relative flex items-center justify-center gap-2.5 rounded-xl px-2 py-3 text-sm font-semibold transition-colors sm:px-3', on ? 'text-white' : 'text-ink/65 hover:text-brand')}
                  >
                    {on && <motion.span layoutId="legal-tab" className="absolute inset-0 rounded-xl bg-brand shadow-lg shadow-brand/30" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                    <span className="relative h-5 w-7 shrink-0 overflow-hidden rounded-[4px] ring-1 ring-black/10">
                      <e.Flag className="size-full" />
                    </span>
                    <span className="relative hidden truncate sm:inline">{t(`entities.${e.id}.name`)}</span>
                    {on && (
                      <span className="absolute inset-x-3 bottom-1 h-0.5 overflow-hidden rounded-full bg-white/20">
                        <motion.span className="block h-full origin-left bg-gold rtl:origin-right" style={{ scaleX: s.progress }} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* spotlight card */}
          <div id="legal-panel" role="tabpanel" className="relative mt-4 overflow-hidden rounded-[2rem] border border-brand/10 bg-gradient-to-br from-white to-[#f1f3f9] shadow-xl shadow-brand/5">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                key={id}
                custom={dir}
                variants={{ enter: (d) => ({ x: `${d * 8}%`, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d) => ({ x: `${d * -8}%`, opacity: 0 }) }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: EASE }}
                className="grid md:grid-cols-[0.8fr_1.2fr]"
              >
                {/* flag stage */}
                <div className="relative grid min-h-[200px] place-items-center overflow-hidden bg-gradient-to-br from-brand-900 to-brand-950 p-8 md:min-h-[280px]">
                  <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
                  <div className="absolute size-64 rounded-full bg-gold/25 blur-[80px]" aria-hidden />
                  {[1, 2, 3].map((r) => (
                    <motion.span key={r} className="absolute rounded-full border border-white/10" style={{ width: 120 + r * 70, height: 120 + r * 70 }} animate={{ scale: [1, 1.06, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, delay: r * 0.4, repeat: Infinity }} aria-hidden />
                  ))}
                  <motion.div initial={{ rotate: -14, scale: 0.7 }} animate={{ rotate: -6, scale: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.1 }} className="relative">
                    <motion.div animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative h-28 w-44 overflow-hidden rounded-2xl shadow-2xl shadow-black/50 ring-4 ring-white/15 md:h-32 md:w-48">
                      <Flag className="size-full" />
                      <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent" aria-hidden />
                    </motion.div>
                  </motion.div>
                </div>
                {/* text */}
                <div className="flex flex-col justify-center p-7 md:p-10">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                    <ShieldCheck className="size-3.5" /> {t('entity')}
                  </span>
                  <h4 className="heading-title mt-4">{t(`entities.${id}.name`)}</h4>
                  <p className="mt-4 text-[15px] leading-relaxed text-ink/65 md:text-base">{t(`entities.${id}.text`)}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <Reveal y={12} className="mt-8 flex justify-center">
          <ArrowLink href="/company/regulations">{t('viewMore')}</ArrowLink>
        </Reveal>
      </div>
      </div>
    </section>
  );
}
