'use client';
import { useTranslations } from 'next-intl';
import { PORTAL, LIVE_ACCOUNT_HREF } from '@/config/menu';
import CtaBand from '@/components/shared/CtaBand';

export function DepositCta() {
  const t = useTranslations('depositPage.cta');
  return (
    <CtaBand
      id="fund"
      title={t('title')}
      description={t('description')}
      primary={{ label: t('live'), href: LIVE_ACCOUNT_HREF }}
      secondary={{ label: t('login'), href: PORTAL.clientPortal }}
      risk={t('risk')}
    />
  );
}
