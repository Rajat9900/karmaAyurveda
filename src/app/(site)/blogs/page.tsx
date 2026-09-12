import React from 'react';
import { Metadata } from 'next';
import PageBanner from '@/components/ui/PageBanner';
import BlogCard from '@/components/blog/BlogCard';
import { getPublicBlogsAction } from '@/app/actions/blogActions';

export const metadata: Metadata = {
  title: 'Blogs & Articles | Karma Ayurveda',
  description: 'Read the latest articles, insights, and health tips from the experts at Karma Ayurveda.',
};

export default async function BlogsPage() {
  const blogs = await getPublicBlogsAction();

  return (
    <main className="flex flex-col min-h-screen">
      
      {/* Page Header */}
      <PageBanner 
        title={<>Our <span className="text-[#d2621a]">Blogs</span></>}
        subtitle="Latest news, health tips, and Ayurvedic insights."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Blogs' }
        ]}
      />

      {/* Blogs Grid Section */}
      <section className="py-16 md:py-24 bg-[#f4fbf6]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}