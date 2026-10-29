'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Check, CircleCheck, CircleX, Coins, FileCheck2, Hourglass, Lock, OctagonAlert, Percent, ShieldAlert, UserCheck, Wallet } from 'lucide-react';
import NumberedSteps from '@/components/shared/NumberedSteps';
import { SectionIntro } from '@/components/shared/SectionIntro';
import { flagFor } from '@/components/shared/formKit';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';

const ICONS = { eligibility: UserCheck, 'bonus-size': Percent, cashback: Coins, 'bonus-use': Lock, withdrawal: Wallet, expiry: Hourglass, abuse: ShieldAlert, 'stop-out': OctagonAlert, acknowledgment: FileCheck2 };

/** "How to Apply" — four numbered steps. */
export function MarginSteps() {
  const t = useTranslations('marginBonusPage.steps');
  return (
    <section className="relative overflow-hidden bg-[#eef0f5] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <NumberedSteps steps={t.raw('items')} className="mt-12 md:mt-16" />
      </div>
    </section>
  );
}

/** Section id currently in view (for the contents list). */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

/** A point is a string or { text, items[] } (a lead-in with its own sub-list). */
function Points({ points }) {
  return (
    <ul className="space-y-3.5">
      {points.map((p, i) => {
        const text = typeof p === 'string' ? p : p.text;
        return (
          <li key={i} className="flex gap-3">
            <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand ring-1 ring-brand/10">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <p>{text}</p>
              {p.items && (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 rounded-xl bg-[#f6f7fb] px-3.5 py-2.5 text-sm text-ink/75 ring-1 ring-brand/5">
                      <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Restricted({ label, countries }) {
  return (
    <div className="mt-6 rounded-2xl border border-down/15 bg-down/[0.04] p-4">
      <p className="text-sm font-semibold text-down">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {countries.map((c) => (
          <span key={c.code} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-ink/75 ring-1 ring-ink/10">
            <span aria-hidden>{flagFor(c.code)}</span>
            {c.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function Examples({ label, eligible, ineligible, items }) {
  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <Stagger className="mt-3 grid gap-3 sm:grid-cols-2" stagger={0.08}>
        {items.map((ex) => (
          <StaggerItem key={ex.text} className={cn('flex flex-col gap-3 rounded-2xl border p-4 text-sm leading-relaxed', ex.eligible ? 'border-up/20 bg-up/[0.05]' : 'border-down/20 bg-down/[0.04]')}>
            <span className={cn('inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', ex.eligible ? 'bg-up/10 text-up' : 'bg-down/10 text-down')}>
              {ex.eligible ? <CircleCheck className="size-3.5" /> : <CircleX className="size-3.5" />}
              {ex.eligible ? eligible : ineligible}
            </span>
            <span className="text-ink/75">{ex.text}</span>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

/** Terms & Conditions — sticky contents (scroll-spy) beside the numbered term cards. */
export function MarginTerms() {
  const t = useTranslations('marginBonusPage.terms');
  const sections = t.raw('sections');
  const [ids] = useState(() => sections.map((s) => s.id));
  const active = useActiveSection(ids);

  return (
    <section id="terms" className="relative scroll-mt-20 bg-white py-14 md:py-24">
      <div className="container-x">
        <SectionIntro title={t('title')} description={t('description')} />

        <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-[260px_1fr] lg:gap-14">
          <aside className="hidden lg:block">
            <nav className="sticky top-28" aria-label={t('contents')}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">{t('contents')}</p>
              <ol className="mt-4 space-y-1 border-s border-brand/10">
                {sections.map((s, i) => (
                  <li key={s.id} className="relative">
                    {active === s.id && <motion.span layoutId="mb-contents" className="absolute -start-px inset-y-0 w-0.5 bg-gold" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                    <a href={`#${s.id}`} className={cn('flex gap-3 py-2 ps-4 text-sm transition-colors', active === s.id ? 'font-semibold text-brand' : 'text-ink/55 hover:text-ink')}>
                      <span className="tabular-nums text-ink/30">{String(i + 1).padStart(2, '0')}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="space-y-5">
            {sections.map((s, i) => {
              const Icon = ICONS[s.id] ?? FileCheck2;
              return (
                <Reveal key={s.id} y={20}>
                  <article id={s.id} className="group relative scroll-mt-28 overflow-hidden rounded-[1.5rem] border border-brand/10 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(41,59,147,0.5)] transition-shadow duration-500 hover:shadow-[0_30px_80px_-40px_rgba(41,59,147,0.6)] md:p-8">
                    <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                    <div className="flex items-center gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-900 text-white shadow-lg shadow-brand/25 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <span className="text-xs font-bold tabular-nums text-gold-700">{String(i + 1).padStart(2, '0')}</span>
                        <h3 className="heading-card">{s.title}</h3>
                      </div>
                    </div>
                    <div className="mt-6 text-[15px] leading-relaxed text-ink/75">
                      <Points points={s.points} />
                      {s.restricted && <Restricted {...s.restricted} />}
                      {s.examples && <Examples {...s.examples} />}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
