'use client';
import { motion } from 'motion/react';
import { Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';

/**
 * Numbered steps in a row: navy number tiles joined by a dashed line with a travelling gold pulse.
 * steps = [{ title, text, tag? }]. `ringClass` should match the section background (keeps the tile cut-out clean).
 */
export default function NumberedSteps({ steps, ringClass = 'ring-[#eef0f5]', className }) {
  const n = steps.length;
  const cols = n === 3 ? 'lg:grid-cols-3' : n === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4';
  const inset = `${50 / n}%`;

  return (
    <div className={cn('relative', className)}>
      <div dir="ltr" className="pointer-events-none absolute top-10 hidden lg:block" style={{ left: inset, right: inset }} aria-hidden>
        <span className="block border-t-2 border-dashed border-brand/25" />
        <motion.span className="absolute -top-[5px] size-2.5 rounded-full bg-gold shadow-[0_0_14px_rgba(182,135,86,0.9)]" animate={{ left: ['0%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }} />
      </div>

      <Stagger className={cn('grid gap-10 sm:grid-cols-2 lg:gap-8', cols)} stagger={0.15}>
        {steps.map((s, i) => (
          <StaggerItem key={s.title} className="group flex flex-col items-center text-center">
            <motion.span
              className="relative grid size-20 place-items-center rounded-[1.4rem] bg-gradient-to-br from-brand to-brand-900 text-2xl font-bold text-white shadow-xl shadow-brand/30"
              initial={{ rotate: -12, scale: 0.6 }}
              whileInView={{ rotate: -6, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 + i * 0.15 }}
              whileHover={{ rotate: 0, scale: 1.08 }}
            >
              <span className={cn('absolute inset-0 rounded-[1.4rem] ring-4', ringClass)} aria-hidden />
              {i + 1}
            </motion.span>
            <h3 className="heading-card mt-7 max-w-[15rem]">{s.title}</h3>
            <p className="mt-3 max-w-[17rem] text-[15px] leading-relaxed text-ink/60">{s.text}</p>
            {s.tag && <span className="mt-4 inline-flex rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand ring-1 ring-brand/10">{s.tag}</span>}
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
