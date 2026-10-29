'use client';
/**
 * react-toastify container in the site theme (rounded white cards, navy text, up/down accent bar).
 * Render once on pages whose forms call `toast.success()` / `toast.error()`.
 */
import { ToastContainer } from 'react-toastify';
import { useLocale } from 'next-intl';
import { getDir } from '@/i18n/locales';

export default function Toaster() {
  const rtl = getDir(useLocale()) === 'rtl';
  return (
    <ToastContainer
      position={rtl ? 'bottom-left' : 'bottom-right'}
      rtl={rtl}
      autoClose={5000}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="light"
      toastClassName="!rounded-2xl !font-sans !text-sm !font-medium !text-ink !shadow-2xl !shadow-brand/15 ring-1 ring-brand/10"
    />
  );
}
