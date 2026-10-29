'use client';
import { useTranslations } from 'next-intl';
import NumberedSteps from '@/components/shared/NumberedSteps';
import { SectionIntro } from '@/components/shared/SectionIntro';

/** How the funds are managed: the explanation, then the four numbered steps. */
export function FundsManaged() {
  const t = useTranslations('compensationFundPage.managed');
  return (
    <section id="how" className="relative overflow-hidden bg-[#eef0f5] py-14 text-ink md:py-24">
      <div className="bg-dots-light mask-radial absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-[90px]" aria-hidden />
      <div className="container-x relative">
        <SectionIntro title={t('title')} description={t('description')} className="max-w-4xl [&_p]:max-w-4xl" />
        <NumberedSteps steps={t.raw('steps')} className="mt-14 md:mt-16" />
      </div>
    </section>
  );
}
