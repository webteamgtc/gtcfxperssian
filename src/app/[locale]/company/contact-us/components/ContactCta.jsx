'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight, Rocket, MonitorPlay } from 'lucide-react';
import { PORTAL, LIVE_ACCOUNT_HREF } from '@/config/menu';
import NavLink from '@/components/shared/nav/NavLink';
import BandLine from '@/components/shared/BandLine';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal } from '@/components/motion';
import { cn } from '@/lib/utils';

/** Same navy band as About Us: headline on one side, the open-account card on the other. */
export function ContactCta() {
  const t = useTranslations('contactPage.cta');
  const actions = [
    { key: 'live', href: LIVE_ACCOUNT_HREF, Icon: Rocket, primary: true },
    { key: 'demo', href: PORTAL.demo, Icon: MonitorPlay, primary: false }
  ];
  return (
    <section id="get-started" className="relative bg-white py-14 text-white md:py-20">
      <div className="container-x">
        <Reveal y={24}>
          <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-700 via-brand-800 to-brand-950 p-6 shadow-2xl shadow-brand/25 md:p-12">
            <span className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
            <motion.span className="absolute -end-24 -top-24 size-80 rounded-full bg-gold/25 blur-[100px]" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
            <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden />
            <BandLine />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
              <h2 className="heading-section">
                <AccentTitle text={t('title')} />
              </h2>
              <div className="rounded-[1.5rem] border border-white/15 bg-white/[0.06] p-5 backdrop-blur md:p-6">
                <p className="text-[15px] font-semibold leading-relaxed text-white/85">{t('card')}</p>
                <div className="mt-5 grid gap-3">
                  {actions.map(({ key, href, Icon, primary }) => (
                    <NavLink
                      key={key}
                      href={href}
                      className={cn(
                        'group flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold transition-all duration-300 hover:-translate-y-0.5',
                        primary ? 'bg-gold text-white shadow-lg shadow-gold/30 hover:bg-gold-600' : 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white hover:text-brand-900'
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      <span className="flex-1">{t(key)}</span>
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
