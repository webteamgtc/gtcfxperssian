'use client';
/**
 * TEMPORARY — design drafts for review. A small bar above a section switches between layouts
 * (also via ?<key>=a|b|c|d in the URL; the choice is remembered for the tab). Never shown on gtcfx.com.
 * Once a layout is chosen: keep it, delete the others, the bar and this file.
 */
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function useDraft(key, options = ['a', 'b', 'c', 'd']) {
  const [value, setValue] = useState(options[0]);
  const [show, setShow] = useState(false);
  useEffect(() => {
    let v = new URLSearchParams(window.location.search).get(key);
    try {
      if (!options.includes(v)) v = sessionStorage.getItem(`gtc_draft_${key}`);
    } catch {}
    if (options.includes(v)) setValue(v);
    setShow(!/(^|\.)gtcfx\.com$/.test(window.location.hostname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const pick = (v) => {
    setValue(v);
    try {
      sessionStorage.setItem(`gtc_draft_${key}`, v);
    } catch {}
  };
  return { value, pick, show, options };
}

export function DraftBar({ draft, labels, dark = false, className }) {
  if (!draft.show) return null;
  return (
    <div className={cn('relative z-20 mb-8 flex justify-center', className)} dir="ltr">
      <div className={cn('flex flex-wrap items-center justify-center gap-1 rounded-full p-1 text-xs font-semibold shadow-lg', dark ? 'border border-white/20 bg-black/50 text-white backdrop-blur' : 'bg-ink text-white')}>
        <span className="px-3 text-white/60">Draft layout:</span>
        {draft.options.map((k) => (
          <button key={k} type="button" onClick={() => draft.pick(k)} aria-pressed={draft.value === k} className={cn('rounded-full px-3 py-1.5 transition-colors', draft.value === k ? 'bg-gold text-white' : 'hover:bg-white/15')}>
            {labels[k]}
          </button>
        ))}
      </div>
    </div>
  );
}
