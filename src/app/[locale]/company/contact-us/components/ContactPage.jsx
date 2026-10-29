'use client';
/**
 * /company/contact-us — content: messages/<locale>/companyPage.json → `contactPage`
 * dark hero → white (how can we help + ticket form) → gray (channels) → dark (support offices)
 * → navy CTA band (same as About Us) → dark footer
 */
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Toaster from '@/components/shared/Toaster';
import { ScrollProgress } from '@/components/motion';
import { ContactHero } from './ContactHero';
import { Help, Channels, Offices } from './Sections';
import { ContactCta } from './ContactCta';

export default function ContactPage() {
  return (
    <div className="overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <Header theme="dark" />
      <main>
        <ContactHero />
        <Help />
        <Channels />
        <Offices />
        <ContactCta />
      </main>
      <Footer theme="dark" />
      <Toaster />
    </div>
  );
}
