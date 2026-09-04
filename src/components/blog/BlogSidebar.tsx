'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blogData';
import { BlogCategory } from '@/app/actions/blogCategoryActions';
import { BlogTag } from '@/app/actions/blogTagActions';
import { Calendar } from 'lucide-react';

interface BlogSidebarProps {
  recentPosts?: BlogPost[];
  categories?: BlogCategory[];
  tags?: BlogTag[];
}

export default function BlogSidebar({ recentPosts = [], categories = [], tags = [] }: BlogSidebarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert("Thank you for your enquiry. Our health expert will contact you shortly.");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <aside className="space-y-8">
      
      {/* Enquiry Form Widget */}
      <div className="bg-[#f4fbf6] p-6 rounded-2xl border border-green-100 shadow-sm">
        <h3 className="text-xl font-bold text-[#1a2e3b] mb-4 border-b border-green-200 pb-3">
          Free Consultation
        </h3>
        <form onSubmit={handleEnquiry} className="space-y-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Your Name" 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] transition-all bg-white text-sm text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div className="relative group">
            <input 
              type="tel" 
              placeholder="Phone Number" 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] transition-all bg-white text-sm text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div className="relative group">
            <textarea 
              placeholder="Describe your health issue..." 
              rows={3}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] transition-all resize-none bg-white text-sm text-gray-900 placeholder:text-gray-500"
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#1f4229] to-[#2e5339] hover:from-[#2e5339] hover:to-[#1f4229] text-white font-bold py-3 rounded-xl hover:shadow-[0_4px_15px_rgba(31,66,41,0.3)] transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSubmitting ? 'Sending...' : 'Submit Enquiry'}
          </button>
        </form>
      </div>

      {/* Recent Blogs Widget */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-[#1a2e3b] mb-4 border-b border-gray-100 pb-3">
          Recent Articles
        </h3>
        <div className="space-y-4">
          {recentPosts.map(post => (
            <div key={post.id} className="flex gap-4 items-center group">
              <Link href={`/blog/${post.slug}`} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              </Link>
              <div>
                <Link href={`/blog/${post.slug}`}>
                  <h4 className="font-bold text-sm text-[#1a2e3b] leading-tight group-hover:text-[#d2621a] transition-colors line-clamp-2 mb-1">
                    {post.title}
                  </h4>
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar size={12} className="text-[#1f4229]" />
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Widget */}
      {categories.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-[#1a2e3b] mb-4 border-b border-gray-100 pb-3">
            Categories
          </h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/category/${cat.slug}`} className="flex justify-between items-center text-gray-600 hover:text-[#d2621a] transition-colors">
                  <span>{cat.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                    {cat.blog_count ?? 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags Widget */}
      {tags.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-[#1a2e3b] mb-4 border-b border-gray-100 pb-3">
            Popular Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-sm text-gray-600 rounded-full hover:bg-[#1f4229] hover:text-white hover:border-[#1f4229] transition-all"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}
