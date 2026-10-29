'use client';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Clock, Languages, ShieldCheck, Info, MessagesSquare, Mail, MessageCircle, ArrowUpRight, MapPin, Navigation } from 'lucide-react';
import { GB, CY } from 'country-flag-icons/react/3x2';
import { SectionIntro, AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, Stagger, StaggerItem, SpotlightCard, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { CONTACT } from '@/config/events';
import { mapDots, project } from '../../regulations/components/mapDots';
import { TicketForm } from './TicketForm';
import { intlLocale } from '@/i18n/locales';

/* ---------------- How can we help + ticket form (white) ---------------- */
const P_ICONS = { responsive: Clock, multilingual: Languages, data: ShieldCheck };
export function Help() {
  const t = useTranslations('contactPage.help');
  const points = t.raw('points');
  return (
    <section id="help" className="relative overflow-hidden bg-white py-14 text-ink md:py-24">
      <div className="absolute -start-40 top-16 size-[440px] rounded-full bg-brand/[0.06] blur-[120px]" aria-hidden />
      <div className="container-x relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal y={16}>
            <h2 className="heading-section">
              <AccentTitle text={t('title')} />
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink/60 md:text-base">{t('description')}</p>
          </Reveal>
          <Stagger className="mt-8 grid gap-3" stagger={0.1}>
            {points.map((p) => {
              const Icon = P_ICONS[p.id] ?? Clock;
              return (
                <StaggerItem key={p.id}>
                  <div className="group flex gap-4 rounded-2xl border border-brand/10 bg-white p-4 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/10 md:p-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand ring-1 ring-brand/10 transition-colors duration-500 group-hover:bg-brand group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="heading-small">{p.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink/60">{p.text}</p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
          <div className="mt-6 flex gap-3 rounded-2xl border border-dashed border-brand/20 bg-[#f6f7fb] p-4 text-sm leading-relaxed text-ink/60">
            <Info className="mt-0.5 size-5 shrink-0 text-brand" />
            <p>{t('disclaimer')}</p>
          </div>
        </div>
        <Reveal y={24}>
          <TicketForm />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Channels (gray) ---------------- */
const CH = {
  chat: { Icon: MessagesSquare, href: `tel:${CONTACT.phone.replace(/\s/g, '')}`, tint: 'from-brand-500 to-brand-800' },
  email: { Icon: Mail, href: `mailto:${CONTACT.email}`, tint: 'from-gold-300 to-gold-700' },
  whatsapp: { Icon: MessageCircle, href: CONTACT.whatsapp, tint: 'from-emerald-400 to-emerald-700', external: true }
};
export function Channels() {
  const t = useTranslations('contactPage.channels');
  const items = t.raw('items');
  return (
    <section id="channels" className="relative scroll-mt-24 overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <Stagger className="mt-12 grid gap-5 md:mt-14 md:grid-cols-3" stagger={0.1}>
          {items.map((it, i) => {
            const c = CH[it.id] ?? CH.chat;
            const mid = i === 1;
            return (
              <StaggerItem key={it.id} className="h-full">
                <motion.a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className={cn('group relative flex h-full flex-col items-center overflow-hidden rounded-[2rem] p-7 text-center transition-shadow duration-500 md:p-8', mid ? 'is-dark bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 text-white shadow-2xl shadow-brand/25' : 'border border-brand/10 bg-white shadow-sm hover:shadow-2xl hover:shadow-brand/10')}
                >
                  {mid && <span className="absolute -end-16 -top-16 size-56 rounded-full bg-gold/25 blur-[80px]" aria-hidden />}
                  <span className="relative grid size-16 place-items-center">
                    <span className={cn('absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110', c.tint)} />
                    <span className={cn('relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg', c.tint)}>
                      <c.Icon className="size-5" />
                    </span>
                  </span>
                  <h3 className="heading-card relative mt-6">{it.title}</h3>
                  <p className={cn('relative mt-2 text-[15px] leading-relaxed', mid ? 'text-white/70' : 'text-ink/60')}>{it.text}</p>
                  <span dir="ltr" className={cn('relative mt-5 inline-flex items-center gap-2 text-sm font-semibold', mid ? 'text-gold-200' : 'text-brand')}>
                    <span className="relative size-2 rounded-full bg-emerald-400">
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400" />
                    </span>
                    {it.value}
                  </span>
                  <span className={cn('relative mt-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors', mid ? 'mt-7 bg-gold text-white group-hover:bg-gold-600' : 'mt-7 border border-brand/15 text-brand group-hover:bg-brand group-hover:text-white')}>
                    {it.cta}
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                  </span>
                </motion.a>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- Offices (dark band) ---------------- */
const FLAGS = { GB, CY };
function OfficeMap({ lon, lat }) {
  const p = project(lon, lat);
  const box = { x0: p.x - 16, x1: p.x + 16, y0: p.y - 9, y1: p.y + 9 };
  const dots = useMemo(() => mapDots(box), [box.x0, box.y0]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <svg viewBox={`${box.x0} ${box.y0} 32 18`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.22" fill="#ffffff" opacity={0.18 + 0.5 * Math.max(0, 1 - Math.hypot(x - p.x, y - p.y) / 14)} />
      ))}
      <motion.circle cx={p.x} cy={p.y} r="0.8" fill="none" stroke="#d2a67a" strokeWidth="0.15" animate={{ r: [0.8, 5], opacity: [0.9, 0] }} transition={{ duration: 2.4, repeat: Infinity }} />
      <circle cx={p.x} cy={p.y} r="0.8" fill="#d2a67a" />
    </svg>
  );
}
function LocalTime({ tz, locale }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <span>--:--</span>;
  return <span dir="ltr">{new Intl.DateTimeFormat(intlLocale(locale), { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(now)}</span>;
}
export function Offices() {
  const t = useTranslations('contactPage.offices');
  const locale = useLocale();
  const items = t.raw('items');
  return (
    <section id="offices" className="relative overflow-hidden py-14 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-brand-950 to-ink" aria-hidden />
      <div className="bg-grid-dark mask-radial absolute inset-0 opacity-70" aria-hidden />
      <div className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[140px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro dark title={t('title')} description={t('description')} />
        <div className="is-dark mx-auto mt-12 grid max-w-5xl gap-6 md:mt-14 md:grid-cols-2">
          {items.map((o, i) => {
            const F = FLAGS[o.code];
            return (
              <motion.article key={o.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, delay: i * 0.15, ease: EASE }}>
                <SpotlightCard className="group h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur transition-colors duration-500 hover:border-gold/30">
                  <div dir="ltr" className="relative aspect-[16/8] overflow-hidden bg-gradient-to-br from-brand-800/70 to-ink">
                    <div className="absolute inset-0 transition-transform duration-[1.2s] group-hover:scale-110">
                      <OfficeMap lon={o.lon} lat={o.lat} />
                    </div>
                    <span className="absolute end-4 top-4 inline-flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-semibold text-white/85 ring-1 ring-white/10 backdrop-blur">
                      <Clock className="size-3.5 text-gold-200" />
                      {t('localTime')} · <LocalTime tz={o.tz} locale={locale} />
                    </span>
                  </div>
                  <div className="p-6 md:p-7">
                    <div className="flex items-center gap-3">
                      {F && <F className="h-6 w-9 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-white/20" />}
                      <h3 className="heading-card">{o.city}</h3>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gold-200">
                      <bdi>{o.entity}</bdi>
                    </p>
                    <address dir="ltr" className="mt-4 flex gap-2.5 text-sm not-italic leading-relaxed text-white/60 rtl:text-end">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-white/40" />
                      <span>
                        {o.address.map((l) => (
                          <span key={l} className="block">
                            {l}
                          </span>
                        ))}
                      </span>
                    </address>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address.join(', '))}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-gold-200">
                      <Navigation className="size-4" />
                      {t('directions')}
                    </a>
                  </div>
                </SpotlightCard>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
