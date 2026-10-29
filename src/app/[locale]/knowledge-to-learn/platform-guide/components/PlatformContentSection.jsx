'use client';
/**
 * Platform guides browser: platform switcher (GTC Go app / client portal) → format tabs (PNG · PDF · Video) with counts
 * + guide-language menu → card grid. Guides come from Google Drive (/api/platform-guide), videos from YouTube
 * (/api/platform-guide/youtube); the guide language is independent of the site language.
 */
import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Download, Eye, FileText, Globe, Image as ImageIcon, MonitorSmartphone, PlayCircle, Smartphone, X } from 'lucide-react';
import NavLink from '@/components/shared/nav/NavLink';
import { Stagger, StaggerItem, EASE } from '@/components/motion';
import { cn } from '@/lib/utils';
import { normalizePlatformGuideLocale, PLATFORM_GUIDE_LOCALES } from '@/lib/platform-guide/locales';
import { usePlatformGuideHook } from '../hooks/usePlatformGuideHook';
import { usePlatformGuideVideosHook } from '../hooks/usePlatformGuideVideosHook';
import { PLATFORMS, guideHref } from '../guides';

const PLATFORM_ICONS = { gtcgo: Smartphone, gettingStarted: MonitorSmartphone };
const FORMAT_ICONS = { png: ImageIcon, pdf: FileText, video: PlayCircle };
const VISIBLE_PDF = 6;

/* ------------------------------------------------------------ controls */

function PlatformSwitch({ value, onChange }) {
  const t = useTranslations('platformGuidePage.platforms');
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {PLATFORMS.map(({ key }) => {
        const Icon = PLATFORM_ICONS[key];
        const on = value === key;
        return (
          <button key={key} type="button" onClick={() => onChange(key)} aria-pressed={on} className={cn('group relative flex items-center gap-4 overflow-hidden rounded-[1.5rem] p-4 text-start ring-1 transition-shadow duration-500 md:p-5', on ? 'text-white shadow-2xl shadow-brand/25 ring-brand' : 'bg-white text-ink ring-brand/10 hover:shadow-xl hover:shadow-brand/10')}>
            {on && (
              <motion.span layoutId="pg-platform" className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950" transition={{ type: 'spring', stiffness: 380, damping: 34 }} aria-hidden>
                <span className="bg-grid-dark absolute inset-0 opacity-50" />
                <span className="absolute -end-10 -top-10 size-40 rounded-full bg-gold/30 blur-3xl" />
              </motion.span>
            )}
            <span className={cn('relative grid size-12 shrink-0 place-items-center rounded-2xl transition-all duration-500 md:size-14', on ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'bg-brand-50 text-brand group-hover:-rotate-6')}>
              <Icon className="size-6" />
            </span>
            <span className="relative flex-1 text-base font-semibold leading-snug md:text-lg">{t(key)}</span>
            <span className={cn('relative grid size-9 shrink-0 place-items-center rounded-full transition-all duration-500', on ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand opacity-0 group-hover:opacity-100')}>
              {on ? <Check className="size-4" strokeWidth={3} /> : <ArrowRight className="size-4 rtl:-scale-x-100" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FormatTabs({ tabs, value, onChange, counts }) {
  const t = useTranslations('platformGuidePage.subTabs');
  return (
    <div className="flex gap-1 rounded-full bg-[#f6f7fb] p-1 ring-1 ring-brand/10" role="tablist">
      {tabs.map((key) => {
        const Icon = FORMAT_ICONS[key];
        const on = value === key;
        return (
          <button key={key} type="button" role="tab" aria-selected={on} onClick={() => onChange(key)} className={cn('relative inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors md:px-5', on ? 'text-white' : 'text-ink/60 hover:text-brand')}>
            {on && <motion.span layoutId="pg-format" className="absolute inset-0 rounded-full bg-brand shadow-lg shadow-brand/25" transition={{ type: 'spring', stiffness: 420, damping: 34 }} aria-hidden />}
            <Icon className="relative size-4" />
            <span className="relative">{t(key)}</span>
            {counts[key] != null && <span className={cn('relative rounded-full px-1.5 text-[11px] tabular-nums', on ? 'bg-white/20' : 'bg-brand/10 text-brand')}>{counts[key]}</span>}
          </button>
        );
      })}
    </div>
  );
}

function LanguageMenu({ value, onChange }) {
  const t = useTranslations('platformGuidePage.languageFilter');
  const [open, setOpen] = useState(false);
  const current = PLATFORM_GUIDE_LOCALES.find((l) => l.code === value) ?? PLATFORM_GUIDE_LOCALES[0];

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="listbox" aria-label={t('ariaLabel')} onClick={() => setOpen((o) => !o)} className="inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-brand/15 transition-colors hover:ring-brand/35">
        <Globe className="size-4 text-gold" />
        <span>{current.name}</span>
        <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold text-brand">{current.label}</span>
        <ChevronDown className={cn('size-4 text-ink/50 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button type="button" aria-label={t('closeMenu')} className="fixed inset-0 z-20 cursor-default" onClick={() => setOpen(false)} />
            <motion.ul role="listbox" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.18 }} className="absolute end-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl shadow-brand/15 ring-1 ring-brand/10">
              {PLATFORM_GUIDE_LOCALES.map((l) => {
                const on = l.code === value;
                return (
                  <li key={l.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={on}
                      onClick={() => {
                        onChange(l.code);
                        setOpen(false);
                      }}
                      className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors', on ? 'bg-brand-50 font-semibold text-brand' : 'text-ink/75 hover:bg-[#f6f7fb]')}
                    >
                      <span className="w-7 text-[11px] font-bold text-ink/40">{l.label}</span>
                      <span className="flex-1">{l.name}</span>
                      {on && <Check className="size-4" />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------ cards */

function CoverCard({ item, href }) {
  return (
    <NavLink href={href} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand/15 hover:ring-brand/25">
      <div className="relative h-52 overflow-hidden bg-brand-50 md:h-60">
        {item.thumbnail && <img src={item.thumbnail} alt={item.title} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="absolute inset-x-0 top-0 h-[220%] w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />}
        <span className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-brand-950/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
        <span className="absolute bottom-4 start-1/2 grid size-11 -translate-x-1/2 translate-y-3 place-items-center rounded-full bg-white text-brand opacity-0 shadow-xl transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 rtl:translate-x-1/2" aria-hidden>
          <Eye className="size-5" />
        </span>
      </div>
      <div className="flex flex-1 items-start justify-between gap-3 p-5">
        <h3 dir="auto" className="font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
          {item.title}
        </h3>
        <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-brand/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand rtl:-scale-x-100" />
      </div>
    </NavLink>
  );
}

function PdfCard({ item, href }) {
  const t = useTranslations('platformGuidePage');
  return (
    <NavLink href={href} className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand/15 hover:ring-brand/25">
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-900 to-ink">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="absolute inset-x-0 top-0 h-[300%] w-full object-cover object-top opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" />
        ) : (
          <span className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
        )}
        <span className="absolute start-5 top-5 grid size-12 place-items-center rounded-2xl bg-white text-red-600 shadow-xl transition-transform duration-500 group-hover:-rotate-6" aria-hidden>
          <FileText className="size-6" />
        </span>
        <span className="absolute end-5 top-5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">PDF</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 dir="auto" className="flex-1 font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
          {item.title}
        </h3>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
          <Download className="size-4" />
          {t('viewPdf')}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
        </span>
      </div>
    </NavLink>
  );
}

function VideoCard({ video, onPlay }) {
  const t = useTranslations('platformGuidePage');
  return (
    <button type="button" onClick={onPlay} className="group flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] bg-white text-start ring-1 ring-brand/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand/15 hover:ring-brand/25">
      <div className="relative aspect-video overflow-hidden bg-brand-900">
        {video.thumbnail && <img src={video.thumbnail} alt={video.title} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />}
        <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" aria-hidden />
        <span className="absolute inset-0 grid place-items-center" aria-hidden>
          <motion.span className="absolute size-16 rounded-full bg-white/40" animate={{ scale: [1, 1.5], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} />
          <span className="relative grid size-14 place-items-center rounded-full bg-white text-brand shadow-xl transition-transform duration-500 group-hover:scale-110">
            <PlayCircle className="size-7" />
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 dir="auto" className="flex-1 font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
          {video.title}
        </h3>
        <span className="mt-3 text-sm font-semibold text-gold-600">{t('watchVideo')}</span>
      </div>
    </button>
  );
}

function VideoModal({ video, onClose }) {
  const t = useTranslations('platformGuidePage');
  useEffect(() => {
    if (!video) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [video, onClose]);

  return (
    <AnimatePresence>
      {video && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={video.title}>
          <button type="button" aria-label={t('closeVideo')} className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-ink shadow-2xl ring-1 ring-white/10" initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} transition={{ duration: 0.35, ease: EASE }}>
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 text-white">
              <p dir="auto" className="truncate text-sm font-semibold">
                {video.title}
              </p>
              <button type="button" onClick={onClose} aria-label={t('closeVideo')} className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                <X className="size-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe title={video.title} src={`${video.embedUrl}?autoplay=1&rel=0`} className="size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Skeletons({ variant }) {
  const n = variant === 'png' ? 8 : 6;
  return (
    <div className={cn('grid gap-5', variant === 'png' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3')} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-brand/10">
          <div className={cn('animate-pulse bg-gradient-to-br from-brand-50 to-[#eef0f7]', variant === 'png' ? 'h-52 md:h-60' : variant === 'pdf' ? 'h-36' : 'aspect-video')} />
          <div className="space-y-2 p-5">
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-brand-50" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-brand-50" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** YouTube playlist player (used when the per-video list isn't available, e.g. no API key). */
function PlaylistPlayer({ src }) {
  const t = useTranslations('platformGuidePage.subTabs');
  return (
    <div className="is-dark relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-900 to-ink p-2 shadow-2xl shadow-brand/20 ring-1 ring-brand/20 md:p-3">
      <motion.span className="absolute -end-20 -top-20 size-72 rounded-full bg-gold/25 blur-[90px]" animate={{ opacity: [0.4, 0.85, 0.4] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
      <div className="relative flex items-center gap-2.5 px-3 pb-3 pt-1.5 text-white">
        <span className="grid size-8 place-items-center rounded-xl bg-gold text-white">
          <PlayCircle className="size-4" />
        </span>
        <span className="text-sm font-semibold">{t('video')}</span>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-black">
        <iframe title={t('video')} src={src} className="size-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      </div>
    </div>
  );
}

function Notice({ children }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[1.75rem] bg-white px-6 py-16 text-center ring-1 ring-brand/10">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand">
        <FileText className="size-6" />
      </span>
      <p className="max-w-md text-sm text-ink/60">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------ section */

export default function PlatformContentSection() {
  const t = useTranslations('platformGuidePage');
  const siteLocale = useLocale();
  const [platform, setPlatform] = useState('gtcgo');
  const [format, setFormat] = useState('png');
  const [guideLocale, setGuideLocale] = useState(() => normalizePlatformGuideLocale(siteLocale));
  const [showAllPdf, setShowAllPdf] = useState(false);
  const [video, setVideo] = useState(null);
  const closeVideo = useCallback(() => setVideo(null), []);

  const hasVideo = PLATFORMS.find((p) => p.key === platform)?.video ?? false;
  const tabs = hasVideo ? ['png', 'pdf', 'video'] : ['png', 'pdf'];
  const { data, loading, error } = usePlatformGuideHook(guideLocale, platform);
  const { videos, loading: videosLoading, error: videosError, meta: videoMeta } = usePlatformGuideVideosHook(guideLocale, hasVideo);
  const playlistOnly = !videosLoading && !videos.length && videoMeta.playlistEmbedUrl; // no API key: YouTube playlist player

  useEffect(() => setGuideLocale(normalizePlatformGuideLocale(siteLocale)), [siteLocale]);

  // fall back to the format that has content
  useEffect(() => {
    if (loading || format === 'video') return;
    if (!data[format].length) {
      const other = format === 'png' ? 'pdf' : 'png';
      if (data[other].length) setFormat(other);
    }
  }, [loading, data, format]);

  const pickPlatform = (key) => {
    setPlatform(key);
    setFormat('png');
    setShowAllPdf(false);
  };

  const isVideo = format === 'video';
  const busy = isVideo ? videosLoading : loading;
  const failed = isVideo ? videosError : error;
  const counts = { png: loading ? null : data.png.length, pdf: loading ? null : data.pdf.length, video: videosLoading || playlistOnly ? null : videos.length };
  const items = isVideo ? videos : format === 'pdf' && !showAllPdf ? data.pdf.slice(0, VISIBLE_PDF) : data[format];
  const empty = { png: t('emptyPng'), pdf: t('emptyPdf'), video: t.has('emptyVideo') ? t('emptyVideo') : t('emptyPng') }[format];
  const viewKey = `${platform}-${format}-${guideLocale}-${busy ? 'busy' : failed ? 'error' : 'ok'}`;

  return (
    <section id="guides" className="relative overflow-clip bg-[#f6f7fb] py-14 md:py-24">
      <div className="bg-grid-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute -end-40 top-20 size-[460px] rounded-full bg-brand/[0.07] blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <PlatformSwitch value={platform} onChange={pickPlatform} />

        <div className="relative z-10 mt-6 flex flex-col gap-3 rounded-[1.75rem] bg-white p-2 shadow-sm ring-1 ring-brand/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="overflow-x-auto">
            <FormatTabs
              tabs={tabs}
              value={format}
              counts={counts}
              onChange={(f) => {
                setFormat(f);
                setVideo(null);
              }}
            />
          </div>
          <LanguageMenu
            value={guideLocale}
            onChange={(code) => {
              setGuideLocale(code);
              setShowAllPdf(false);
            }}
          />
        </div>

        <div className="mt-8 md:mt-10">
          <AnimatePresence mode="wait">
            <motion.div key={viewKey} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
              {busy ? (
                <Skeletons variant={format} />
              ) : failed ? (
                <Notice>{t('loadError')}</Notice>
              ) : isVideo && playlistOnly ? (
                <PlaylistPlayer src={videoMeta.playlistEmbedUrl} />
              ) : !items.length ? (
                <Notice>{empty}</Notice>
              ) : (
                <>
                  <Stagger className={cn('grid gap-5', format === 'png' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3')} stagger={0.05}>
                    {items.map((it) => (
                      <StaggerItem key={it.id} className="h-full">
                        {isVideo ? <VideoCard video={it} onPlay={() => setVideo(it)} /> : format === 'pdf' ? <PdfCard item={it} href={guideHref(platform, it, guideLocale)} /> : <CoverCard item={it} href={guideHref(platform, it, guideLocale)} />}
                      </StaggerItem>
                    ))}
                  </Stagger>
                  {format === 'pdf' && !showAllPdf && data.pdf.length > VISIBLE_PDF && (
                    <div className="mt-10 flex justify-center">
                      <button type="button" onClick={() => setShowAllPdf(true)} className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-brand ring-1 ring-brand/20 transition-colors hover:bg-brand hover:text-white">
                        {t('showAll')}
                        <span className="rounded-full bg-brand/10 px-2 text-xs group-hover:bg-white/20">{data.pdf.length}</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <VideoModal video={video} onClose={closeVideo} />
    </section>
  );
}
