import React from 'react';
import { Metadata } from 'next';
import FaqAccordion from '@/components/faqs/FaqAccordion';
import PageBanner from '@/components/ui/PageBanner';
import { getSiteFaqsAction } from '@/app/actions/siteFaqActions';

export const metadata: Metadata = {
  title: 'FAQs | Karma Ayurveda',
  description: 'Find answers to frequently asked questions about Karma Ayurveda, our treatments, kidney diseases, and more.',
};

export const dynamic = 'force-dynamic';

export default async function FaqsPage() {
  const faqs = await getSiteFaqsAction();

  return (
    <main className="flex flex-col min-h-screen">
      
      {/* Page Header / Hero Section */}
      <PageBanner 
        title={<>Frequently Asked <span className="text-[#d2621a]">Questions</span></>}
        subtitle="Everything you need to know about our natural healing methods."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'FAQs' }
        ]}
      />

      {/* Accordion Section */}
      <FaqAccordion faqs={faqs} />

    </main>
  );
}
