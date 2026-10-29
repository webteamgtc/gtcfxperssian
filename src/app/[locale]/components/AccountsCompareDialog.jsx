'use client';
import { AnimatePresence, motion } from 'motion/react';
import { EASE } from '@/components/motion';
import LiveAccountButton from '@/components/shared/LiveAccountButton';

export function AccountsCompareDialog({ open, onOpenChange, t, items, labels }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-[80] bg-ink/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="accounts-compare-title"
            className="pointer-events-auto max-h-[min(85vh,640px)] w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white shadow-2xl shadow-brand/20"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="border-b border-brand/10 px-6 py-5 md:px-8">
              <h2 id="accounts-compare-title" className="heading-card">
                {t('compare')}
              </h2>
              <p className="mt-1 text-sm text-ink/60">{t('subtitle')}</p>
            </div>
            <div className="overflow-x-auto px-4 py-4 md:px-6">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-brand/10">
                    <th scope="col" className="pb-3 pe-4 text-start font-semibold text-ink/50">
                      <span className="sr-only">{t('compare')}</span>
                    </th>
                    {items.map((item) => (
                      <th scope="col" key={item.id} className="pb-3 px-3 text-center font-bold text-brand">
                        {item.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {labels.map((label) => (
                    <tr key={label} className="border-b border-brand/5 last:border-0">
                      <th scope="row" className="py-3.5 pe-4 text-start font-medium text-ink/55">
                        {label}
                      </th>
                      {items.map((item) => (
                        <td key={item.id + label} className="px-3 py-3.5 text-center font-semibold text-ink">
                          <bdi>{item.values[label]}</bdi>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-brand/10 px-6 py-5 md:px-8">
              <LiveAccountButton look="button" size="lg" variant="primary" arrow={false} className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                {t('open')}
              </LiveAccountButton>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
