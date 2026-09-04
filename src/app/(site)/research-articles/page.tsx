import React from 'react';
import { Metadata } from 'next';
import PageBanner from '@/components/ui/PageBanner';
import { getResearchArticlesAction } from '@/app/actions/researchArticleActions';
import { BookOpen, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Research & Articles | Karma Ayurveda',
  description: 'Research papers, clinical studies, and articles on Ayurvedic approaches to chronic disease management from Karma Ayurveda.',
};

export const dynamic = 'force-dynamic';

export default async function ResearchArticlesPage() {
  const articles = await getResearchArticlesAction();

  return (
    <main className="flex flex-col min-h-screen">

      {/* Page Header */}
      <PageBanner
        title={<>Research <span className="text-[#d2621a]">&amp; Articles</span></>}
        subtitle="Research papers, clinical studies, and articles on Ayurvedic approaches to chronic disease management."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Research & Articles' }
        ]}
      />

      {/* Research Articles Grid */}
      <section className="py-16 md:py-24 bg-[#f4fbf6]">
        <div className="container mx-auto px-4 max-w-7xl">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-[#1a2e3b] mb-4 leading-snug line-clamp-3 flex-grow">
                      {article.title}
                    </h3>
                    <span className="inline-flex items-center gap-2 text-[#1f4229] font-bold text-sm group-hover:text-[#d2621a] transition-colors mt-auto w-max">
                      Read Article
                      <ExternalLink size={15} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No research articles published yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
