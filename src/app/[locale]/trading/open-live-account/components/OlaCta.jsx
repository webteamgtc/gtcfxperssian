'use client';
import { useTranslations } from 'next-intl';
import { PORTAL, LIVE_ACCOUNT_HREF } from '@/config/menu';
import CtaBand from '@/components/shared/CtaBand';

export function OlaCta() {
  const t = useTranslations('openLiveAccountPage.cta');
  return (
    <CtaBand
      id="open-account"
     
      title={t('title')}
      description={t('description')}
      primary={{ label: t('live'), href: LIVE_ACCOUNT_HREF }}
      secondary={{ label: t('demo'), href: PORTAL.demo }}
      riskTitle={t('riskTitle')}
      risk={t('risk')}
    />
  );
}
