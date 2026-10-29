'use client';
/**
 * /company/faqs — GTCFX help center. FAQs come from Strapi (src/lib/faqs.js, loaded by page.jsx).
 * Rhythm: dark hero (search + stats) → white (categories) → gray (top questions) → white (support channels) → navy CTA.
 * The hero search, popular topics and category cards all drive the Top Questions section.
 */
import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LIVE_ACCOUNT_HREF } from '@/config/menu';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CtaBand from '@/components/shared/CtaBand';
import { ScrollProgress } from '@/components/motion';
import FaqHeroSection, { POPULAR } from './FaqHeroSection';
import FaqCategoriesSection from './FaqCategoriesSection';
import FaqTopQuestionsSection from './FaqTopQuestionsSection';
import FaqHumanSupportSection from './FaqHumanSupportSection';

const scrollToQuestions = () => document.getElementById('questions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function FaqsPage({ groups }) {
  const t = useTranslations('faqsPage.cta');
  const [active, setActive] = useState(groups[0]?.key ?? null);
  const [query, setQuery] = useState('');

  const findGroup = useCallback((word) => groups.find((g) => g.label.toLowerCase().includes(word)), [groups]);
  const countFor = useCallback((word) => findGroup(word)?.count ?? 0, [findGroup]);
  const previewFor = useCallback((word, n = 3) => (findGroup(word)?.questions ?? []).slice(0, n).map((q) => q.q), [findGroup]);

  const pickGroup = useCallback(
    (keyOrWord, scroll = true) => {
      const g = groups.find((x) => x.key === keyOrWord) ?? findGroup(keyOrWord);
      if (!g) return;
      setQuery('');
      setActive(g.key);
      if (scroll) scrollToQuestions();
    },
    [groups, findGroup]
  );

  const search = useCallback((q) => {
    setQuery(q);
    if (q) scrollToQuestions();
  }, []);

  const topic = useCallback(
    (key) => {
      const p = POPULAR[key];
      if (p.group) pickGroup(p.group);
      else search(p.search);
    },
    [pickGroup, search]
  );

  return (
    <div className="overflow-x-clip bg-white text-ink">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <FaqHeroSection onSearch={search} onTopic={topic} />
        <FaqCategoriesSection countFor={countFor} previewFor={previewFor} onPick={pickGroup} />
        <FaqTopQuestionsSection groups={groups} active={active} onPick={(k) => pickGroup(k, false)} query={query} onClear={() => setQuery('')} />
        <FaqHumanSupportSection />
        <CtaBand id="start" title={t('title')} description={t('description')} primary={{ label: t('openLiveAccount'), href: LIVE_ACCOUNT_HREF }} secondary={{ label: t('openDemoAccount'), href: '/trading/free-demo-account' }} />
      </main>
      <Footer theme="dark" />
    </div>
  );
}
