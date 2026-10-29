'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { LinkedInIcon } from '@/components/shared/icons';
import { SectionHeading, Ambient } from '@/components/shared/blocks';
import { Reveal, WordReveal, TextGenerate, Parallax, MaskReveal } from '@/components/motion';

export function Leaders() {
  const t = useTranslations('leaders');
  const people = [{ k: 'ceo', photo: '/ceo.webp' }];
  return (
    <section className="relative overflow-hidden bg-white py-10 text-ink md:py-16">
      <div className="bg-dots-light mask-radial pointer-events-none absolute inset-0 opacity-30" />
      <Ambient tone="light" />
      <div className="container-x relative">
        {people.map((p) => (
          <div key={p.k} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
            <div className="lg:pe-4">
              <SectionHeading title={t('title')} subtitle={t('subtitle')} align="start" className="max-w-xl" />
              <Reveal y={16} className="mt-10 md:mt-12">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-700">{t(`${p.k}.role`)}</span>
              </Reveal>
                <h3 className="heading-title mt-4">
                  <WordReveal text={t(`${p.k}.name`)} />
                </h3>
                <TextGenerate text={`“${t(`${p.k}.quote`)}”`} className="mt-6 text-lg font-light leading-relaxed text-ink/70 md:text-2xl" />
                <Reveal delay={0.4} className="mt-10 flex items-center gap-4">
                  <span className="h-px w-16 bg-gold" />
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm transition hover:border-gold hover:bg-gold hover:text-white"
                  >
                    <LinkedInIcon className="size-4" /> {t(`${p.k}.linkedin`)}
                  </a>
                </Reveal>
              </div>
              <div className="relative lg:ps-4">
                <div className="absolute -inset-4 rounded-[2.5rem] bg-brand/15 blur-2xl" aria-hidden />
                <Parallax offset={30}>
                  <MaskReveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-brand/10 bg-white shadow-xl shadow-brand/10" from="circle">
                    <Image src={p.photo} alt={t(`${p.k}.name`)} fill className="object-cover object-top" sizes="(max-width: 1024px) 100vw, 560px" priority />
                  </MaskReveal>
                </Parallax>
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', delay: 0.6 }}
                  className="absolute -bottom-6 end-6 grid size-24 place-items-center rounded-full bg-gold text-white shadow-2xl shadow-gold/25"
                >
                  <Quote className="size-10 rtl:-scale-x-100" />
                </motion.div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
