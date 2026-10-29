'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Target, Users } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, EASE } from '@/components/motion';

// Dubai skyline in line art: [x, width, height, kind]
const TOWERS = [
  [10, 22, 160], [36, 16, 190], [56, 26, 220], [88, 14, 170],
  [104, 18, 0, 'burj'], [128, 30, 230], [162, 18, 200], [184, 20, 250], [208, 22, 210],
  [234, 30, 240, 'grid'], [268, 28, 200], [300, 30, 180, 'dome'], [334, 20, 190], [358, 26, 220], [388, 16, 190], [408, 22, 170]
];
const BASE = 280;

function Skyline() {
  const draw = (i) => ({ initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true, amount: 0.3 }, transition: { duration: 1.4, delay: 0.1 + i * 0.05, ease: EASE } });
  return (
    <svg dir="ltr" viewBox="0 0 440 300" className="h-auto w-full" aria-hidden>
      <motion.line x1="0" x2="440" y1={BASE} y2={BASE} stroke="#0b0b0f" strokeOpacity="0.5" strokeWidth="1.5" {...draw(0)} />
      {TOWERS.map(([x, w, h, kind], i) => {
        if (kind === 'burj') {
          const d = `M${x} ${BASE} L${x + 2} ${BASE - 120} Q${x + w / 2} ${BASE - 250} ${x + w / 2} ${BASE - 270} Q${x + w / 2} ${BASE - 250} ${x + w - 2} ${BASE - 120} L${x + w} ${BASE}`;
          return (
            <g key={i}>
              <motion.path d={d} fill="none" stroke="#293b93" strokeWidth="2" {...draw(i)} />
              <motion.circle cx={x + w / 2} cy={BASE - 252} r="3.5" fill="#293b93" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </g>
          );
        }
        const top = BASE - h;
        const d = kind === 'dome' ? `M${x} ${BASE} L${x} ${top + 15} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${top + 15} L${x + w} ${BASE}` : `M${x} ${BASE} L${x} ${top} L${x + w} ${top} L${x + w} ${BASE}`;
        return (
          <g key={i}>
            <motion.path d={d} fill="none" stroke="#0b0b0f" strokeOpacity="0.55" strokeWidth="1.3" {...draw(i)} />
            {kind === 'grid' && [1, 2, 3, 4].map((k) => <motion.line key={k} x1={x} x2={x + w} y1={top + (h / 5) * k} y2={top + (h / 5) * k} stroke="#0b0b0f" strokeOpacity="0.35" {...draw(i + k)} />)}
            {kind === 'grid' && <motion.line x1={x + w / 2} x2={x + w / 2} y1={top} y2={BASE} stroke="#0b0b0f" strokeOpacity="0.35" {...draw(i + 2)} />}
            {(i === 7 || kind === 'dome') && <circle cx={x + w / 2} cy={top + 22} r="2.5" fill="#293b93" />}
          </g>
        );
      })}
    </svg>
  );
}

export function Story() {
  const t = useTranslations('aboutUsPage.story');
  const paragraphs = t.raw('paragraphs');
  return (
    <section id="story" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="absolute -start-40 top-1/3 size-[460px] rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro layout="split" title={t('title')} description={t('description')} />

        <div className="mt-12 grid items-center gap-10 md:mt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          {/* HQ card */}
          <Reveal y={30} className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-brand/10 bg-white p-6 shadow-xl shadow-brand/5 md:p-8">
              <div className="bg-grid-light absolute inset-0 opacity-60" aria-hidden />
              <span className="absolute start-0 top-0 h-10 w-10 border-s-2 border-t-2 border-brand/70" aria-hidden />
              <span className="absolute bottom-0 end-0 h-10 w-10 border-b-2 border-e-2 border-brand/70" aria-hidden />
              <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                <span className="size-1.5 animate-pulse rounded-full bg-gold" /> {t('hq')}
              </div>
              <div className="relative mt-6">
                <Skyline />
              </div>
              <div dir="ltr" className="relative mt-3 flex justify-between text-xs font-medium tabular-nums text-ink/50">
                <span>{t('lat')}</span>
                <span>{t('lng')}</span>
              </div>
            </div>
            <motion.div
              className="absolute -end-3 bottom-16 rounded-2xl border border-brand/10 bg-white px-5 py-3 text-center shadow-xl shadow-brand/10 md:-end-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6, ease: EASE }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/45">{t('since')}</div>
              <div className="heading-accent text-2xl font-bold">2012</div>
            </motion.div>
          </Reveal>

          {/* text */}
          <div>
            <Reveal y={16}>
              <h3 className="heading-title">
                <span className="heading-accent">{t('headline')}</span>
              </h3>
            </Reveal>
            {paragraphs.map((p, i) => (
              <Reveal key={i} y={12} delay={0.1 + i * 0.08}>
                <p className="mt-5 text-pretty text-[15px] leading-relaxed text-ink/65 md:text-base">{p}</p>
              </Reveal>
            ))}
            <Reveal y={12} delay={0.25} className="mt-8 grid gap-4 border-t border-brand/10 pt-6 sm:grid-cols-2">
              {[
                [Target, t('focusLabel'), t('focus')],
                [Users, t('serviceLabel'), t('service')]
              ].map(([Icon, label, value]) => (
                <div key={label} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-brand/10">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">{label}</div>
                    <div className="mt-1 text-sm font-semibold leading-snug text-ink">{value}</div>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
