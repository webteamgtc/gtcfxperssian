'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { CountUp } from '@/components/motion';

export function LeverageGauge() {
    const t = useTranslations('features');
    const R = 90;
    const C = Math.PI * R;
    return (
      <div className="relative w-full max-w-[280px]">
        <svg viewBox="0 0 220 120" className="w-full">
          <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="14" strokeLinecap="round" />
          <motion.path
            d="M20 110 A90 90 0 0 1 200 110"
            fill="none"
            stroke="url(#gg)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            whileInView={{ strokeDashoffset: C * 0.04 }}
            viewport={{ once: true }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <defs>
            <linearGradient id="gg" x1="0" x2="1">
              <stop offset="0%" stopColor="#8390d4" />
              <stop offset="100%" stopColor="#d2a67a" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <div className="text-4xl font-bold tracking-tight">
            1:<CountUp value={2000} />
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">{t('maxLeverage')}</div>
        </div>
      </div>
    );
  }
