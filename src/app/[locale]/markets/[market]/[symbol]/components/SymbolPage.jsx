'use client';
/**
 * /markets/<market>/<symbol> — one component for every symbol page.
 * Dark terminal hero (live quote + chart) → gray specification tiles + about → dark platforms stage → the market page's CTA.
 */
import { useMemo } from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/motion';
import { useLiveRows } from '@/components/shared/ticker';
import { MarketCtx } from '../../components/shared';
import { MARKET_CTA } from '../../components/cta';
import { SymbolCtx } from './shared';
import { QuoteTerminal } from './quote';
import { SpecsTiles } from './specs';
import { UnlockStage } from './unlock';

export default function SymbolPage({ page, symbols, sym, spec }) {
  const base = useMemo(() => [sym], [sym]);
  const [row] = useLiveRows(base, 500);
  const Cta = MARKET_CTA[page.template];
  return (
    <MarketCtx.Provider value={{ page, symbols }}>
      <SymbolCtx.Provider value={{ page, symbols, sym, spec, row }}>
        <div className="overflow-x-clip bg-white text-ink">
          <ScrollProgress />
          <Header theme="dark" />
          <main>
            <QuoteTerminal />
            <SpecsTiles />
            <UnlockStage />
            <Cta />
          </main>
          <Footer theme="dark" />
        </div>
      </SymbolCtx.Provider>
    </MarketCtx.Provider>
  );
}
