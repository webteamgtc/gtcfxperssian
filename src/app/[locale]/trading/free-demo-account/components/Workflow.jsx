'use client';
import { useTranslations } from 'next-intl';
import NumberedSteps from '@/components/shared/NumberedSteps';
import { SectionIntro } from '@/components/shared/SectionIntro';

/** Four numbered steps joined by a dashed line; a gold pulse travels along it and the tiles pop in. */
export function Workflow() {
  const t = useTranslations('freeDemoAccount.workflow');

  return (
    <section id="workflow" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-[90px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} />
        <NumberedSteps steps={t.raw('steps')} className="mt-14 md:mt-16" />
      </div>
    </section>
  );
}
