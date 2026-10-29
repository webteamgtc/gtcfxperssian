'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { FolderOpen, Newspaper, Mail, ArrowUpRight } from 'lucide-react';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const ICONS = { brand: FolderOpen, press: Newspaper };
const float = (d, delay = 0) => ({ animate: { y: [0, -d, 0] }, transition: { duration: 5 + d / 4, repeat: Infinity, ease: 'easeInOut', delay } });

/** Floating "press kit" composition (no photo needed): logo folder, palette, press release, typography. */
function PressKit({ t }) {
  return (
    <div dir="ltr" className="relative aspect-[5/4] w-full overflow-hidden rounded-[2rem] border border-brand/10 bg-gradient-to-br from-white to-[#e6e9f4] shadow-sm" aria-hidden>
      <div className="bg-dots-light absolute inset-0 opacity-60" />
      <span className="absolute -end-16 -top-16 size-64 rounded-full bg-gold/15 blur-[80px]" />
      <span className="absolute -bottom-20 -start-16 size-64 rounded-full bg-brand/15 blur-[80px]" />

      {/* folder with logo */}
      <motion.div {...float(10)} className="absolute left-[8%] top-[12%] w-[46%] rotate-[-6deg] rounded-2xl bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 p-5 shadow-2xl shadow-brand/30">
        <span className="absolute -top-3 left-5 h-4 w-16 rounded-t-lg bg-brand-700" />
        <div className="text-2xl font-black tracking-tight text-white">
          GTC<span className="text-gold-200">FX</span>
        </div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{t('kit.logo')}</div>
        <div className="mt-6 flex gap-2">
          {['SVG', 'PNG', 'EPS'].map((f) => (
            <span key={f} className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-white/80 ring-1 ring-white/15">
              {f}
            </span>
          ))}
        </div>
      </motion.div>

      {/* palette */}
      <motion.div {...float(8, 0.6)} className="absolute right-[8%] top-[8%] w-[34%] rotate-[5deg] rounded-2xl bg-white p-4 shadow-xl shadow-brand/10 ring-1 ring-brand/10">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/45">{t('kit.palette')}</div>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {['#293b93', '#b68756', '#0a0e26', '#eef0f5'].map((c) => (
            <span key={c} className="aspect-square rounded-lg ring-1 ring-black/5" style={{ background: c }} />
          ))}
        </div>
      </motion.div>

      {/* press release */}
      <motion.div {...float(12, 1.2)} className="absolute bottom-[8%] right-[10%] w-[44%] rotate-[3deg] rounded-2xl bg-white p-4 shadow-2xl shadow-brand/15 ring-1 ring-brand/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">{t('kit.release')}</span>
          <span className="size-2 rounded-full bg-gold" />
        </div>
        <div className="mt-3 h-14 rounded-lg bg-gradient-to-r from-brand-700 to-brand-950" />
        <div className="mt-3 space-y-1.5">
          {[100, 92, 80, 64].map((w) => (
            <span key={w} className="block h-1.5 rounded-full bg-brand/10" style={{ width: `${w}%` }} />
          ))}
        </div>
      </motion.div>

      {/* typography */}
      <motion.div {...float(7, 1.8)} className="absolute bottom-[12%] left-[12%] w-[30%] rotate-[-3deg] rounded-2xl bg-white/90 p-4 shadow-xl shadow-brand/10 ring-1 ring-brand/10 backdrop-blur">
        <div className="text-4xl font-extrabold leading-none text-brand">Aa</div>
        <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/45">{t('kit.type')} · Inter</div>
      </motion.div>
    </div>
  );
}

/** Gray section: press-kit visual + the two resources + media contact. */
export function MediaResources() {
  const t = useTranslations('eventsPage.media');
  const items = t.raw('items');
  const email = t('email');
  return (
    <section id="media" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <div className="mt-12 grid items-center gap-8 md:mt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          <Reveal y={24}>
            <PressKit t={t} />
          </Reveal>
          <Stagger className="grid gap-4" stagger={0.1}>
            {items.map((it) => {
              const Icon = ICONS[it.id] ?? FolderOpen;
              return (
                <StaggerItem key={it.id}>
                  <a href={`mailto:${email}?subject=${encodeURIComponent(it.subject)}`} className="group relative flex gap-5 overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/10 md:p-7">
                    <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gold to-brand transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" aria-hidden />
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="block">
                      <span className="heading-card block">{it.title}</span>
                      <span className="mt-2 block text-[15px] leading-relaxed text-ink/60">{it.text}</span>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                        {it.cta}
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                      </span>
                    </span>
                  </a>
                </StaggerItem>
              );
            })}
            <StaggerItem>
              <div className="is-dark flex gap-5 rounded-[1.75rem] bg-gradient-to-r from-brand-700 via-brand-800 to-brand-950 p-6 text-white shadow-xl shadow-brand/20 md:p-7">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-gold-200 ring-1 ring-white/15">
                  <Mail className="size-5" />
                </span>
                <p className="text-[15px] leading-relaxed text-white/75">
                  {t('contactStart')}{' '}
                  <a href={`mailto:${email}`} className="font-semibold text-gold-200 underline-offset-4 hover:underline">
                    {email}
                  </a>{' '}
                  {t('contactEnd')}
                </p>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>
  );
}
