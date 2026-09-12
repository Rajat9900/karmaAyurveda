'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  FolderOpen,
  Image as ImageIcon,
  UploadCloud
} from 'lucide-react';
import { deleteBlogAction } from '@/app/actions/blogActions';
import { BlogPost } from '@/lib/blogData';

interface BlogsManagerClientProps {
  initialBlogs: BlogPost[];
}

export default function BlogsManagerClient({ initialBlogs }: BlogsManagerClientProps) {
  // Blogs state & search
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);
  const [blogSearch, setBlogSearch] = useState('');
  const [blogStatusFilter, setBlogStatusFilter] = useState<string>('all'); // all, published, drafts, scheduled

  // Statistics
  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter(b => b.status !== 'Inactive').length;
  const draftBlogs = blogs.filter(b => b.status === 'Inactive').length;
  const scheduledBlogs = 0;

  // Delete blog post
  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    const originalBlogs = [...blogs];
    setBlogs(prev => prev.filter(b => b.id !== id));

    const result = await deleteBlogAction(id);
    if (!result.success) {
      alert(result.error || 'Failed to delete blog.');
      setBlogs(originalBlogs);
    }
  };

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      blog.category.toLowerCase().includes(blogSearch.toLowerCase()) ||
      blog.author.toLowerCase().includes(blogSearch.toLowerCase());

    const matchesStatus =
      blogStatusFilter === 'all' ||
      (blogStatusFilter === 'published' && blog.status !== 'Inactive') ||
      (blogStatusFilter === 'inactive' && blog.status === 'Inactive') ||
      (blogStatusFilter === 'scheduled' && false);

    return matchesSearch && matchesStatus;
  });

  // Dynamic colors for category tags
  const getCategoryStyles = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('kidney') || cat.includes('proteinuria')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    } else if (cat.includes('diet') || cat.includes('nutrition')) {
      return 'bg-orange-50 text-orange-700 border-orange-100';
    } else if (cat.includes('therapy') || cat.includes('panchakarma')) {
      return 'bg-purple-50 text-purple-700 border-purple-100';
    } else if (cat.includes('lifestyle') || cat.includes('yoga')) {
      return 'bg-blue-50 text-blue-700 border-blue-100';
    }
    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">All Blogs</span>
      </div>

      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/10">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Blog Posts</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage and organize your blog content</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/blogs/bulk-upload"
            className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-extrabold text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <UploadCloud className="w-4.5 h-4.5" />
            Bulk Upload
          </Link>
          <Link
            href="/admin/blogs/add"
            className="bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/10 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4.5 h-4.5" />
            Add New Blog
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[32px] font-black text-slate-900 leading-none">{totalBlogs}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Total Posts</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[32px] font-black text-[#059669] leading-none">{publishedBlogs}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Published</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[32px] font-black text-orange-500 leading-none">{draftBlogs}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Inactive</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[32px] font-black text-blue-500 leading-none">{scheduledBlogs}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Scheduled</span>
        </div>
      </div>

      {/* Filter Tabs and Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        
        {/* Pills */}
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button 
            onClick={() => setBlogStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              blogStatusFilter === 'all'
                ? 'bg-emerald-50 text-[#059669] border border-emerald-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            All <span className="text-[10px] ml-0.5 opacity-80">{totalBlogs}</span>
          </button>
          <button 
            onClick={() => setBlogStatusFilter('published')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              blogStatusFilter === 'published'
                ? 'bg-emerald-50 text-[#059669] border border-emerald-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Published <span className="text-[10px] ml-0.5 opacity-80">{publishedBlogs}</span>
          </button>
          <button
            onClick={() => setBlogStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              blogStatusFilter === 'inactive'
                ? 'bg-emerald-50 text-[#059669] border border-emerald-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Inactive <span className="text-[10px] ml-0.5 opacity-80">{draftBlogs}</span>
          </button>
          <button 
            onClick={() => setBlogStatusFilter('scheduled')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              blogStatusFilter === 'scheduled'
                ? 'bg-emerald-50 text-[#059669] border border-emerald-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Scheduled <span className="text-[10px] ml-0.5 opacity-80">{scheduledBlogs}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-[#059669] transition-colors" />
          <input
            type="text"
            placeholder="Search by title..."
            value={blogSearch}
            onChange={(e) => setBlogSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] text-xs bg-white text-slate-700 placeholder:text-slate-400 font-semibold"
          />
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-600">
            <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                </th>
                <th className="py-4 px-5">Post</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No blog posts found. Click "+ Add New Blog" to create.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {blog.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="max-w-md">
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-1">{blog.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono font-medium block mt-0.5">/blog/{blog.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getCategoryStyles(blog.category)}`}>
                        {blog.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500 font-semibold">{blog.date}</td>
                    <td className="py-4 px-5">
                      {blog.status === 'Inactive' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#03543f] text-[10px] font-black border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/blogs/edit/${blog.id}`}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}
