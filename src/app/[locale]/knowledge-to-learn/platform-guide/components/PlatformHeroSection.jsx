'use client';
/** Platform guides hero (dark): breadcrumb, title, copy, live-account CTA beside a GTC Go phone with floating format chips. */
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { FileText, Image as ImageIcon, PlayCircle } from 'lucide-react';

import Breadcrumb from '@/components/shared/Breadcrumb';
import HeroBackdrop from '@/components/shared/HeroBackdrop';
import GtcGoPhone from '@/components/shared/GtcGoPhone';
import { EASE } from '@/components/motion';
import { HUB_PATH } from '../../courses';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

const CHIPS = [
  { key: 'png', Icon: ImageIcon, className: 'start-0 top-[18%]', delay: 0.5, float: 5 },
  { key: 'pdf', Icon: FileText, className: 'end-0 top-[40%]', delay: 0.65, float: 6 },
  { key: 'video', Icon: PlayCircle, className: 'start-[6%] bottom-[14%]', delay: 0.8, float: 5.5 }
];

function HeroVisual() {
  const t = useTranslations('platformGuidePage.subTabs');
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[400px]" aria-hidden>
      <div className="absolute inset-[12%] rounded-full bg-brand/40 blur-3xl" />
      <motion.div className="absolute inset-[4%] rounded-full border border-dashed border-white/15" animate={{ rotate: 360 }} transition={{ duration: 70, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute inset-x-[22%] top-[6%]" initial={{ y: 60, rotate: 8, opacity: 0 }} animate={{ y: 0, rotate: -5, opacity: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <GtcGoPhone className="w-full" />
        </motion.div>
      </motion.div>
      {CHIPS.map(({ key, Icon, className, delay, float }) => (
        <motion.div key={key} className={`absolute ${className}`} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, type: 'spring', stiffness: 200, damping: 16 }}>
          <motion.span className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-xl" animate={{ y: [0, -8, 0] }} transition={{ duration: float, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="grid size-8 place-items-center rounded-xl bg-gold text-white">
              <Icon className="size-4" />
            </span>
            {t(key)}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}

export default function PlatformHeroSection() {
  const t = useTranslations('platformGuidePage.hero');
  const tk = useTranslations('knowledgePage.breadcrumb');
  return (
    <section className="is-dark relative overflow-hidden bg-ink pb-16 pt-36 text-white md:pb-20 md:pt-44">
      <HeroBackdrop />
      <div className="container-x relative">
        <Breadcrumb className="lg:justify-start" items={[{ label: tk('home'), href: '/' }, { label: tk('current'), href: HUB_PATH }, { label: t('title') }]} />
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="text-center lg:text-start">
            <motion.h1 className="heading-page text-balance" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
              {t('title')}
            </motion.h1>
            <motion.p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg lg:mx-0" initial={{ y: 10 }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              {t('description')}
            </motion.p>
            <motion.div className="mt-9 flex justify-center lg:justify-start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <LiveAccountButton variant="gold">
                {t('primaryCta')}
              </LiveAccountButton>
            </motion.div>
          </div>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
