import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageBanner from '@/components/ui/PageBanner';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { getBlogsAction, getBlogsByCategoryAction } from '@/app/actions/blogActions';
import { getBlogCategoriesAction, getBlogCategoryBySlugAction } from '@/app/actions/blogCategoryActions';
import { getBlogTagsAction } from '@/app/actions/blogTagActions';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getBlogCategoryBySlugAction(slug);

  if (!category) {
    return { title: 'Category Not Found | Karma Ayurveda' };
  }

  return {
    title: `${category.name} Articles | Karma Ayurveda Blog`,
    description: `Read the latest ${category.name} articles, insights, and health tips from the experts at Karma Ayurveda.`
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getBlogCategoryBySlugAction(slug);

  if (!category) {
    notFound();
  }

  const [blogs, allPosts, categories, tags] = await Promise.all([
    getBlogsByCategoryAction(slug),
    getBlogsAction(),
    getBlogCategoriesAction(),
    getBlogTagsAction()
  ]);
  const recentPosts = allPosts.slice(0, 3);

  return (
    <main className="flex flex-col min-h-screen">

      {/* Page Header */}
      <PageBanner
        title={<>{category.name} <span className="text-[#d2621a]">Articles</span></>}
        subtitle="Latest news, health tips, and Ayurvedic insights."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Blogs', href: '/blogs' },
          { label: category.name }
        ]}
      />

      {/* Blogs Grid + Sidebar */}
      <section className="py-16 md:py-24 bg-[#f4fbf6]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Left: Blog Grid */}
            <div className="lg:col-span-8">
              {blogs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {blogs.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 font-semibold bg-white rounded-2xl border border-gray-100">
                  No articles found in this category yet.
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-4">
              <BlogSidebar recentPosts={recentPosts} categories={categories} tags={tags} />
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
