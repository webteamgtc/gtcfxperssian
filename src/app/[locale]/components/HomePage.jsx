'use client';

import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Toaster from '@/components/shared/Toaster';
import { HeadingStyle } from '@/components/shared/blocks';
import { ScrollProgress } from '@/components/motion';
import { Hero } from './Hero';
import { Features } from './Features';
import { Markets } from './Markets';
import { Stats } from './Stats';
import { Platforms } from './Platforms';
import { Accounts } from './Accounts';
import { Leaders } from './Leaders';
import { Faq } from './Faq';
import { Register } from './Register';

export default function HomePage() {
  return (
    <div className="dark overflow-x-clip bg-ink text-white">
      <ScrollProgress />
      <HeadingStyle.Provider value="index">
        <Header theme="dark" />
        <main>
          <Hero />
          <Features />
          <Markets />
          <Stats />
          <Platforms />
          <Accounts />
          <Leaders />
          <Faq />
          <Register />
        </main>
        <Footer theme="dark" />
        <Toaster />
      </HeadingStyle.Provider>
    </div>
  );
}
