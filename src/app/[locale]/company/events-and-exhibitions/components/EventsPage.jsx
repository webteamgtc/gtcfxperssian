'use client';
/**
 * /company/events-and-exhibitions
 * UI copy: messages/<locale>/companyPage.json → `eventsPage`; events: Strapi (via page.js props)
 * dark hero (event pass + registration) → white (archive by year) → dark (why we show up)
 * → gray (media & partner resources) → navy CTA band → dark footer
 */
import { useState } from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Toaster from '@/components/shared/Toaster';
import { ScrollProgress } from '@/components/motion';
import { EventsHero } from './EventsHero';
import { Archive } from './Archive';
import { ShowUp } from './ShowUp';
import { MediaResources } from './MediaResources';
import { EventsCta } from './EventsCta';

export default function EventsPage({ upcoming, archive }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <EventsHero events={upcoming} index={index} setIndex={setIndex} />
        {/* with no upcoming events the archive is the first thing on screen, so its intro shows on load */}
        <Archive archive={archive} first={!upcoming?.length} />
        <ShowUp />
        <MediaResources />
        <EventsCta />
      </main>
      <Footer theme="dark" />
      <Toaster />
    </div>
  );
}
