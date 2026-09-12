import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageBanner from '@/components/ui/PageBanner';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { getPublicBlogsAction, getBlogsByTagAction } from '@/app/actions/blogActions';
import { getBlogCategoriesAction } from '@/app/actions/blogCategoryActions';
import { getBlogTagBySlugAction, getBlogTagsAction } from '@/app/actions/blogTagActions';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  // Route params arrive percent-encoded (e.g. Unicode slugs) — decode before using as a lookup key.
  const slug = decodeURIComponent(resolvedParams.slug);
  const tag = await getBlogTagBySlugAction(slug);

  if (!tag) {
    return { title: 'Tag Not Found | Karma Ayurveda' };
  }

  return {
    title: `#${tag.name} Articles | Karma Ayurveda Blog`,
    description: `Read the latest articles tagged "${tag.name}" from the experts at Karma Ayurveda.`
  };
}

export default async function BlogTagPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const tag = await getBlogTagBySlugAction(slug);

  if (!tag) {
    notFound();
  }

  const [blogs, allPosts, categories, tags] = await Promise.all([
    getBlogsByTagAction(slug),
    getPublicBlogsAction(),
    getBlogCategoriesAction(),
    getBlogTagsAction()
  ]);
  const recentPosts = allPosts.slice(0, 3);

  // The sidebar shows only the latest 15 categories/tags rather than the full lists, which
  // have grown too long for a sidebar widget.
  const sidebarCategories = [...categories].sort((a, b) => b.id - a.id).slice(0, 15);
  const sidebarTags = [...tags].sort((a, b) => b.id - a.id).slice(0, 15);

  return (
    <main className="flex flex-col min-h-screen">

      {/* Page Header */}
      <PageBanner
        title={<>Tag: <span className="text-[#d2621a]">{tag.name}</span></>}
        subtitle="Latest news, health tips, and Ayurvedic insights."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Blogs', href: '/blogs' },
          { label: `#${tag.name}` }
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
                  No articles found with this tag yet.
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-4">
              <BlogSidebar recentPosts={recentPosts} categories={sidebarCategories} tags={sidebarTags} />
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
