'use client';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavLink from '@/components/shared/nav/NavLink';
import ArrowLink from '@/components/shared/ArrowLink';
import { liveAccountHref } from '@/config/menu';

/**
 * The "Open live account" button used across the site → /<locale>/live-account-application.
 *
 *   <LiveAccountButton />                                 gold pill with the arrow badge, label "Open Live Account"
 *   <LiveAccountButton variant="primary">{t('cta')}</LiveAccountButton>   page-specific label
 *   <LiveAccountButton look="button" size="lg" />         plain button + arrow (heroes)
 *   <LiveAccountButton account="ecn-account" />           preselects that account on the application page
 *
 * look 'arrow' (default): ArrowLink — variant 'gold' | 'primary' | 'light'
 * look 'button': Button — variant 'gold' | 'primary' | 'outline' | …, size 'sm' | 'md' | 'lg'; arrow={false} hides the icon
 */
export default function LiveAccountButton({ children, account, look = 'arrow', variant = 'gold', size = 'lg', arrow = true, className, ...rest }) {
  const t = useTranslations('menu.links');
  const href = liveAccountHref(account);
  const label = children ?? t('openLive');

  if (look === 'button') {
    return (
      <Button as={NavLink} href={href} variant={variant} size={size} className={className} {...rest}>
        {label}
        {arrow && <ArrowRight className="rtl:-scale-x-100" />}
      </Button>
    );
  }
  return (
    <ArrowLink href={href} variant={variant} className={className} {...rest}>
      {label}
    </ArrowLink>
  );
}
