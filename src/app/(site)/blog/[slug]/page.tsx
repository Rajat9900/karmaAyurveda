import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Calendar, User, Tag as TagIcon } from 'lucide-react';
import PageBanner from '@/components/ui/PageBanner';
import BlogSidebar from '@/components/blog/BlogSidebar';
import WebStoriesSlider from '@/components/blog/WebStoriesSlider';
import { getBlogsAction, getBlogBySlugAction } from '@/app/actions/blogActions';
import { getBlogCategoriesAction } from '@/app/actions/blogCategoryActions';
import { getBlogTagsAction } from '@/app/actions/blogTagActions';
import { getPublicWebStoriesAction } from '@/app/actions/webStoryActions';

// Generate static params for all known blog posts to prerender them
export async function generateStaticParams() {
  const posts = await getBlogsAction();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogBySlugAction(resolvedParams.slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.meta_title || `${post.title} | Karma Ayurveda Blog`,
    description: post.meta_des || post.excerpt,
    keywords: post.meta_keywords || `${post.category.toLowerCase()}, ayurveda, health`
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getBlogBySlugAction(resolvedParams.slug);

  // If the slug doesn't match any post, return a 404 page
  if (!post) {
    notFound();
  }

  const [allPosts, categories, tags, webStories] = await Promise.all([
    getBlogsAction(),
    getBlogCategoriesAction(),
    getBlogTagsAction(),
    getPublicWebStoriesAction()
  ]);
  const recentPosts = allPosts.filter(p => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="flex flex-col min-h-screen bg-white">
      
      {/* Hero Banner (Abstracted) */}
      <PageBanner 
        title={<span className="line-clamp-2 md:px-12">{post.title}</span>}
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Blogs', href: '/blogs' },
          { label: 'Article' }
        ]}
      />

      {/* Article Content & Sidebar */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left: Main Article Content */}
            <div className="lg:col-span-8">
              {/* Article Header & Meta */}
              <div className="mb-10 text-center lg:text-left">
                {post.category_slug ? (
                  <Link
                    href={`/category/${post.category_slug}`}
                    className="inline-block py-1 px-3 rounded-full bg-green-50 text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100 hover:bg-green-100 transition-colors"
                  >
                    {post.category}
                  </Link>
                ) : (
                  <span className="inline-block py-1 px-3 rounded-full bg-green-50 text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
                    {post.category}
                  </span>
                )}

                <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#d2621a]" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#d2621a]" />
                    <span>By {post.author}</span>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-12 rounded-3xl overflow-hidden shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              </div>

              {/* Rich Text Content */}
              <article 
                className="text-gray-700 text-lg leading-relaxed mb-12 
                           [&>p]:mb-6 
                           [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-[#1a2e3b] [&>h3]:mt-10 [&>h3]:mb-4 
                           [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 
                           [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2 
                           [&>strong]:text-[#1a2e3b] [&>strong]:font-bold 
                           [&>em]:italic"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && post.tags[0] !== '' && (
                <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-gray-100">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-[#1a2e3b] mr-1">
                    <TagIcon size={16} className="text-[#d2621a]" />
                    Tags:
                  </span>
                  {post.tags.map((tagName, idx) => {
                    const tagSlug = post.tag_slugs?.[idx];
                    return tagSlug ? (
                      <Link
                        key={idx}
                        href={`/tag/${tagSlug}`}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-sm text-gray-600 rounded-full hover:bg-[#1f4229] hover:text-white hover:border-[#1f4229] transition-all"
                      >
                        {tagName}
                      </Link>
                    ) : (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-sm text-gray-600 rounded-full"
                      >
                        {tagName}
                      </span>
                    );
                  })}
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

      {/* Web Stories Slider — full-width section */}
      <WebStoriesSlider stories={webStories} />

    </main>
  );
}
