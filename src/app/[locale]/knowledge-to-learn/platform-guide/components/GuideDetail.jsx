'use client';
/**
 * /knowledge-to-learn/platform-guide/<platform>/<slug> — one guide: full image (PNG) or embedded PDF with download,
 * then more guides of the same platform and format.
 * Rhythm: dark hero → white (guide viewer) → gray (more guides) → navy CTA.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, Download, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import NavLink from '@/components/shared/nav/NavLink';
import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import { AccentTitle } from '@/components/shared/SectionIntro';
import { Reveal, ScrollProgress, Stagger, StaggerItem, EASE } from '@/components/motion';
import PlatformCtaSection from './PlatformCtaSection';
import { HUB_PATH } from '../../courses';
import { GUIDES_PATH, guideHref } from '../guides';

function Hero({ platform, item }) {
  const t = useTranslations('platformGuidePage');
  const tk = useTranslations('knowledgePage.breadcrumb');
  const Icon = item.type === 'pdf' ? FileText : ImageIcon;
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-14 pt-36 text-white md:pb-16 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tk('home'), href: '/' }, { label: tk('current'), href: HUB_PATH }, { label: t('hero.title'), href: GUIDES_PATH }, { label: item.title }]} />
        <div className="mt-10 text-center lg:text-start">
          <NavLink href={`${GUIDES_PATH}#guides`} className="inline-flex items-center gap-1.5 text-sm font-medium text-white/55 transition-colors hover:text-gold-200">
            <ArrowLeft className="size-4 rtl:-scale-x-100" />
            {t('backToGuides')}
          </NavLink>
          <motion.div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-200 ring-1 ring-gold/30">{t(`platforms.${platform}`)}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/75 ring-1 ring-white/10">
              <Icon className="size-3.5" /> {t(`subTabs.${item.type}`)}
            </span>
          </motion.div>
          <motion.h1 dir="auto" className="heading-page mt-5 max-w-4xl text-balance" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE, delay: 0.05 }}>
            {item.title}
          </motion.h1>
          {item.type === 'pdf' && (
            <motion.div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="group inline-flex h-13 items-center gap-2.5 rounded-full bg-gold ps-7 pe-2 text-base font-semibold text-white shadow-lg shadow-gold/30 transition-colors hover:bg-gold-600">
                {t('downloadPdf')}
                <span className="grid size-9 place-items-center rounded-full bg-white text-gold-700 transition-transform group-hover:translate-y-0.5">
                  <Download className="size-4" />
                </span>
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function Viewer({ item }) {
  return (
    <section className="relative bg-white py-12 md:py-16">
      <div className="container-x">
        <Reveal y={24}>
          <div dir="ltr" className="relative overflow-hidden rounded-[2rem] bg-[#f6f7fb] p-2 shadow-2xl shadow-brand/10 ring-1 ring-brand/10 md:p-3">
            <div className="flex items-center gap-1.5 px-3 pb-2.5 pt-1" aria-hidden>
              <span className="size-2.5 rounded-full bg-down/60" />
              <span className="size-2.5 rounded-full bg-gold/70" />
              <span className="size-2.5 rounded-full bg-up/60" />
            </div>
            <div className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-brand/10">
              {item.type === 'pdf' ? (
                <iframe title={item.title} src={item.previewUrl} className="block h-[min(82vh,960px)] w-full" allow="autoplay" />
              ) : (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="group relative block">
                  <img src={item.previewUrl} alt={item.title} referrerPolicy="no-referrer" className="mx-auto block h-auto w-full" />
                  <span className="absolute end-4 top-4 grid size-10 place-items-center rounded-full bg-ink/60 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100" aria-hidden>
                    <ExternalLink className="size-4" />
                  </span>
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MoreGuides({ platform, items, guideLocale }) {
  const t = useTranslations('platformGuidePage');
  if (!items.length) return null;
  return (
    <section className="relative overflow-hidden bg-[#f6f7fb] py-14 md:py-20">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <Reveal y={16} className="flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-start">
          <h2 className="heading-section">
            <AccentTitle text={t('moreGuides')} />
          </h2>
          <NavLink href={`${GUIDES_PATH}#guides`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-gold-600">
            <ArrowLeft className="size-4 rtl:-scale-x-100" /> {t('backToGuides')}
          </NavLink>
        </Reveal>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {items.map((it) => (
            <StaggerItem key={it.id} className="h-full">
              <NavLink href={guideHref(platform, it, guideLocale)} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand/15">
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-brand-700 to-brand-950">
                  {it.thumbnail ? (
                    <img src={it.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-x-0 top-0 h-[260%] w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-white/80">
                      <FileText className="size-10" strokeWidth={1.5} />
                    </span>
                  )}
                </div>
                <div className="flex flex-1 items-start justify-between gap-3 p-5">
                  <h3 dir="auto" className="text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-brand md:text-[15px]">
                    {it.title}
                  </h3>
                  <ArrowUpRight className="size-4 shrink-0 text-brand/40 transition-all group-hover:text-brand rtl:-scale-x-100" />
                </div>
              </NavLink>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export default function GuideDetail({ platform, item, more, guideLocale }) {
  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <Hero platform={platform} item={item} />
        <Viewer item={item} />
        <MoreGuides platform={platform} items={more} guideLocale={guideLocale} />
        <PlatformCtaSection />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
