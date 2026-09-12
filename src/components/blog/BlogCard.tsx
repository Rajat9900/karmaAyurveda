import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/lib/blogData';
import { stripHtml } from '@/lib/stripHtml';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      
      {/* Thumbnail */}
      <div className="relative h-56 overflow-hidden">
        <Link href={`/blog/${post.slug}`} className="block w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {post.categories && post.categories.length > 0 ? (
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[calc(100%-2rem)]">
            {post.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#1f4229] uppercase tracking-wider shadow-sm hover:bg-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        ) : post.category && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#1f4229] uppercase tracking-wider shadow-sm">
            {post.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-[#d2621a]" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-[#d2621a]" />
            <span>{post.author}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-[#1a2e3b] mb-3 leading-snug group-hover:text-[#1f4229] transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
          {stripHtml(post.excerpt)}
        </p>

        {/* Read More Link */}
        <Link 
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-[#1f4229] font-bold hover:text-[#d2621a] transition-colors mt-auto w-max"
        >
          Read Article <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
