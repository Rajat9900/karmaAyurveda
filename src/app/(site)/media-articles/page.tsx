import React from 'react';
import { Metadata } from 'next';
import PageBanner from '@/components/ui/PageBanner';
import { getMediaArticlesAction } from '@/app/actions/mediaArticleActions';
import { Newspaper, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Media & Press | Karma Ayurveda',
  description: 'Karma Ayurveda in the news — press coverage, media features, and articles about our work in Ayurvedic healthcare.',
};

export const dynamic = 'force-dynamic';

export default async function MediaArticlesPage() {
  const articles = await getMediaArticlesAction();

  return (
    <main className="flex flex-col min-h-screen">

      {/* Page Header */}
      <PageBanner
        title={<>Media <span className="text-[#d2621a]">&amp; Press</span></>}
        subtitle="Karma Ayurveda in the news — coverage and features from leading publications."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Media' }
        ]}
      />

      {/* Media Articles Grid */}
      <section className="py-16 md:py-24 bg-[#f4fbf6]">
        <div className="container mx-auto px-4 max-w-7xl">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={article.article_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="relative h-80 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[#1f4229] font-bold text-sm group-hover:text-[#d2621a] transition-colors">
                      Read Article
                      <ExternalLink size={15} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No media coverage published yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
