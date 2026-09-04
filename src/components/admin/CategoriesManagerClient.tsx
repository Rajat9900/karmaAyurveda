'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  Folder, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { 
  BlogCategory,
  createBlogCategoryAction, 
  updateBlogCategoryAction, 
  deleteBlogCategoryAction 
} from '@/app/actions/blogCategoryActions';

interface CategoriesManagerClientProps {
  initialCategories: BlogCategory[];
}

export default function CategoriesManagerClient({ initialCategories }: CategoriesManagerClientProps) {
  const [categories, setCategories] = useState<BlogCategory[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Stats
  const totalCategories = categories.length;
  const totalBlogAssociations = categories.reduce((sum, cat) => sum + (cat.blog_count || 0), 0);
  const emptyCategories = categories.filter(cat => !cat.blog_count).length;

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNameInput(name);
    
    // Only auto-generate slug in create mode (or if slug matches generated format of old name)
    if (!isEditing) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .replace(/\s+/g, '-')       // replace spaces with dashes
        .replace(/-+/g, '-');        // collapse multiple dashes
      setSlugInput(generatedSlug);
    }
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!nameInput.trim() || !slugInput.trim()) {
      setError('Name and slug are required fields.');
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing && editingId) {
        // Edit Action
        const result = await updateBlogCategoryAction(editingId, { name: nameInput, slug: slugInput });
        if (result.success) {
          setSuccess('Category updated successfully!');
          // Update state dynamically
          setCategories(prev => 
            prev.map(cat => 
              cat.id === editingId 
                ? { ...cat, name: nameInput, slug: slugInput } 
                : cat
            )
          );
          handleCancelEdit();
        } else {
          setError(result.error || 'Failed to update category.');
        }
      } else {
        // Create Action
        const result = await createBlogCategoryAction({ name: nameInput, slug: slugInput });
        if (result.success) {
          setSuccess('Category created successfully!');
          
          // Re-fetch category details or insert placeholder into state (count: 0)
          // To be 100% accurate, let's append a temporary object, and let Next.js revalidate
          const tempId = Date.now().toString();
          setCategories(prev => [
            ...prev, 
            { id: parseInt(tempId) || 0, name: nameInput, slug: slugInput, blog_count: 0 }
          ].sort((a, b) => a.name.localeCompare(b.name)));
          
          setNameInput('');
          setSlugInput('');
        } else {
          setError(result.error || 'Failed to create category.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
      startTransition(() => {
        // Triggers server-side router refresh
      });
    }
  };

  // Setup editing mode
  const handleStartEdit = (category: BlogCategory) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(category.id);
    setNameInput(category.name);
    setSlugInput(category.slug);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setNameInput('');
    setSlugInput('');
  };

  // Delete category
  const handleDelete = async (category: BlogCategory) => {
    const message = category.name === 'General'
      ? 'Are you sure you want to delete the General category? This will fail if there are blogs assigned to it.'
      : `Are you sure you want to delete the category "${category.name}"? Any blogs in this category will be automatically reassigned to "General".`;
      
    if (!confirm(message)) return;

    setError(null);
    setSuccess(null);

    const originalCategories = [...categories];
    // Optimistically update UI (remove category, and if deleting something, increment General's blog count)
    setCategories(prev => {
      const filtered = prev.filter(c => c.id !== category.id);
      if (category.name !== 'General') {
        return filtered.map(c => 
          c.name === 'General' 
            ? { ...c, blog_count: (c.blog_count || 0) + (category.blog_count || 0) }
            : c
        );
      }
      return filtered;
    });

    const result = await deleteBlogCategoryAction(category.id);
    if (result.success) {
      setSuccess('Category deleted successfully.');
      startTransition(() => {});
    } else {
      setError(result.error || 'Failed to delete category.');
      setCategories(originalCategories);
    }
  };

  // Filter categories by search query
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <Link href="/admin/blogs" className="hover:text-slate-650">Blogs</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Categories</span>
      </div>

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/10">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Blog Categories</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Organize blog posts into distinct therapeutic topics</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[32px] font-black text-slate-900 leading-none">{totalCategories}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Total Categories</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[32px] font-black text-emerald-600 leading-none">{totalBlogAssociations}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Blogs Categorized</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[32px] font-black text-orange-500 leading-none">{emptyCategories}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2.5">Empty Categories</span>
        </div>
      </div>

      {/* Layout Grid: List vs. Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3: Categories List Table */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search Row */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 px-3">Category Directory</span>
            <div className="relative group w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs bg-white text-slate-700 placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-600">
                <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Name</th>
                    <th className="py-4 px-5">URL Slug</th>
                    <th className="py-4 px-5 text-center">Blog Count</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <Folder className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                              <Tag className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-slate-900">{category.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-mono text-slate-400 text-[11px]">/blog-category/{category.slug}</span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                            {category.blog_count || 0}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(category)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Category"
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

        </div>

        {/* Right 1/3: Form Panel (Add/Edit) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-6 space-y-4">
            
            {/* Form Header */}
            <div>
              <h3 className="font-black text-sm text-slate-955 tracking-tight flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isEditing ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                {isEditing ? 'Modify existing name and URL endpoint' : 'Create a fresh blog categorization topic'}
              </p>
            </div>

            {/* Error/Success Feedbacks */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-bold text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Category Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chronic Diseases"
                  value={nameInput}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition-all bg-white font-semibold text-slate-805"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">URL Slug*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. chronic-diseases"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition-all bg-white font-mono font-bold text-slate-805"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting || isPending}
                  className={`px-5 py-2.5 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60 transition-all ${
                    isEditing 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {submitting || isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Update Category' : 'Create Category'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>

    </main>
  );
}
