'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileEdit, ArrowLeft, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { createBlogAction, updateBlogAction, uploadBlogImageAction } from '@/app/actions/blogActions';
import { BlogPost } from '@/lib/blogData';
import { BlogCategory } from '@/app/actions/blogCategoryActions';
import { BlogTag } from '@/app/actions/blogTagActions';

// Import Quill snow stylesheet
import 'quill/dist/quill.snow.css';

interface BlogFormClientProps {
  editingBlog?: BlogPost;
  categories: BlogCategory[];
  tagsList: BlogTag[];
}

export default function BlogFormClient({ editingBlog, categories, tagsList }: BlogFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  // Convert a stored display date (e.g. "Jul 28, 2026") to the yyyy-mm-dd format
  // needed by a native <input type="date">, falling back to today if unparseable.
  const toDateInputValue = (displayDate?: string) => {
    const parsed = displayDate ? new Date(displayDate) : new Date();
    const d = isNaN(parsed.getTime()) ? new Date() : parsed;
    return d.toISOString().slice(0, 10);
  };

  const [formState, setFormState] = useState({
    title: editingBlog?.title || '',
    slug: editingBlog?.slug || '',
    excerpt: editingBlog?.excerpt || '',
    content: editingBlog?.content || '',
    author: editingBlog?.author || 'Dr. Puneet Dhawan',
    category: editingBlog?.category || (categories && categories.length > 0 ? categories[0].name : 'Kidney Health'),
    image: editingBlog?.image || '', // holds image path from db or upload URL
    date: editingBlog?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    meta_title: editingBlog?.meta_title || '',
    meta_keywords: editingBlog?.meta_keywords || '',
    meta_des: editingBlog?.meta_des || '',
    head_script: editingBlog?.head_script || '',
    footer_script: editingBlog?.footer_script || '',
    status: editingBlog?.status || 'Active'
  });

  const [dateInput, setDateInput] = useState(toDateInputValue(editingBlog?.date));

  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(editingBlog?.tagIds || []);

  const handleToggleTag = (tagId: number) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingBlog?.image || null);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('test') === 'true') {
        setIsTestMode(true);
      }
    }
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize Quill Editor dynamically
  useEffect(() => {
    const initQuill = async () => {
      if (editorRef.current && !quillRef.current) {
        try {
          const QuillClass = (await import('quill')).default;
          
          quillRef.current = new QuillClass(editorRef.current, {
            theme: 'snow',
            modules: {
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
              ]
            }
          });

          // Set initial HTML if editing
          if (editingBlog?.content) {
            quillRef.current.clipboard.dangerouslyPasteHTML(editingBlog.content);
          } else if (formState.content) {
            quillRef.current.clipboard.dangerouslyPasteHTML(formState.content);
          }

          // Listen to changes
          quillRef.current.on('text-change', () => {
            const htmlContent = editorRef.current?.querySelector('.ql-editor')?.innerHTML || '';
            setFormState(prev => ({ ...prev, content: htmlContent }));
          });

        } catch (err) {
          console.error('Failed to load QuillJS:', err);
        }
      }
    };

    initQuill();
  }, [editingBlog]);

  // Handle title input change, auto-generating slug in create mode
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')       // replace spaces with dashes
      .replace(/-+/g, '-');        // reduce multiple dashes

    setFormState(prev => ({
      ...prev,
      title,
      slug: editingBlog ? prev.slug : generatedSlug,
      meta_title: editingBlog ? prev.meta_title : `${title} | Karma Ayurveda Blog`,
      meta_keywords: editingBlog ? prev.meta_keywords : `${prev.category.toLowerCase()}, ayurveda, wellness, news`,
      meta_des: editingBlog ? prev.meta_des : prev.excerpt || `Read about ${title} on the official Karma Ayurveda blog.`
    }));
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!formState.title || !formState.slug || !formState.content || formState.content === '<p><br></p>') {
      setError('Title, Slug, and Body Content are required fields.');
      setSubmitting(false);
      return;
    }

    // Require image on creation, optional on update (unless in test mode)
    if (!editingBlog && !imageFile && !isTestMode) {
      setError('Featured image is required for new blog posts.');
      setSubmitting(false);
      return;
    }

    let finalImageUrl = formState.image;

    // 1. Upload the image file first if a new one is selected
    if (imageFile) {
      try {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        const uploadResult = await uploadBlogImageAction(uploadData);
        if (!uploadResult.success) {
          setError(uploadResult.error || 'Failed to upload featured image.');
          setSubmitting(false);
          return;
        }

        finalImageUrl = uploadResult.url || '';
      } catch (err) {
        console.error(err);
        setError('An unexpected error occurred during image upload.');
        setSubmitting(false);
        return;
      }
    } else if (isTestMode && !editingBlog) {
      finalImageUrl = '/upload/blog/mock-image.png';
    }

    // 2. Prepare post data
    const postPayload = {
      ...formState,
      image: finalImageUrl,
      tagIds: selectedTagIds
    };

    try {
      if (editingBlog) {
        // Update Action
        const result = await updateBlogAction(editingBlog.id, postPayload);
        if (result.success) {
          startTransition(() => {
            router.push('/admin/blogs');
            router.refresh();
          });
        } else {
          setError(result.error || 'Failed to update blog post.');
          setSubmitting(false);
        }
      } else {
        // Create Action
        const result = await createBlogAction(postPayload);
        if (result.success) {
          startTransition(() => {
            router.push('/admin/blogs');
            router.refresh();
          });
        } else {
          setError(result.error || 'Failed to create blog post.');
          setSubmitting(false);
        }
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected server error occurred while saving the post.');
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <Link href="/admin/blogs" className="hover:text-slate-650">Blogs</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">{editingBlog ? 'Edit' : 'Add'}</span>
      </div>

      {/* Page Title & Cancel Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/10">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {editingBlog ? 'Edit Blog Post' : 'Add New Blog'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {editingBlog ? 'Update existing post content and metadata' : 'Publish a new rich text blog post'}
            </p>
          </div>
        </div>

        <Link
          href="/admin/blogs"
          className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
      </div>

      {/* Main Form Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-6">
        
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs font-bold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Blog Title*</label>
            <input
              type="text"
              required
              placeholder="e.g. 5 Simple Herbs for Kidney Health"
              value={formState.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
            />
          </div>

          {/* Slug Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">URL Slug (Auto-generated)*</label>
            <input
              type="text"
              required
              placeholder="e.g. 5-simple-herbs-for-kidney-health"
              value={formState.slug}
              onChange={(e) => setFormState(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition-all bg-white font-mono font-bold text-slate-800"
            />
          </div>

          {/* Grid Author, Category, Date, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Author Name</label>
              <input
                type="text"
                placeholder="Dr. Puneet Dhawan"
                value={formState.author}
                onChange={(e) => setFormState(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category*</label>
              <select
                value={formState.category}
                onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
              >
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value="General">General</option>
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Blog Date</label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => {
                  const isoValue = e.target.value;
                  setDateInput(isoValue);
                  const parsed = new Date(`${isoValue}T00:00:00`);
                  if (!isNaN(parsed.getTime())) {
                    setFormState(prev => ({
                      ...prev,
                      date: parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    }));
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</label>
              <select
                value={formState.status}
                onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Tags Multi-Select badges */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Associated Tags</label>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {tagsList && tagsList.length > 0 ? (
                tagsList.map(tag => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => handleToggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-250 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })
              ) : (
                <span className="text-xs text-slate-400 italic">No tags configured. You can create tags in Blog Tags Management.</span>
              )}
            </div>
          </div>

          {/* Image Upload Input & Preview */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Featured Image*</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              
              {/* Preview Thumbnail */}
              <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Featured Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-300" />
                )}
              </div>

              {/* Selector File inputs */}
              <div className="space-y-1 flex-grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-slate-500
                    file:mr-4 file:py-1.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-[11px] file:font-black
                    file:bg-emerald-50 file:text-emerald-700
                    hover:file:bg-emerald-100
                    cursor-pointer"
                />
                <span className="text-[9px] font-bold text-slate-450 block">
                  Select a local JPG, PNG, or WEBP image. It will be securely stored in `/public/upload/blog`.
                </span>
              </div>

            </div>
          </div>

          {/* Excerpt Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Brief Excerpt*</label>
            <textarea
              required
              placeholder="A short summary of the blog post to display on lists..."
              rows={2}
              value={formState.excerpt}
              onChange={(e) => setFormState(prev => ({ 
                ...prev, 
                excerpt: e.target.value,
                meta_des: editingBlog ? prev.meta_des : e.target.value
              }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition-all resize-none bg-white font-semibold text-slate-800"
            ></textarea>
          </div>

          {/* Quill Editor Block */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Body Content*</label>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Quill Editor Container */}
              <div ref={editorRef} className="h-80 text-xs text-slate-800 font-medium"></div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* SEO Meta Fields */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">SEO Configurations</span>
            
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Meta Title</label>
              <input
                type="text"
                placeholder="SEO Blog Page Title"
                value={formState.meta_title}
                onChange={(e) => setFormState(prev => ({ ...prev, meta_title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Meta Keywords</label>
              <input
                type="text"
                placeholder="comma-separated keywords..."
                value={formState.meta_keywords}
                onChange={(e) => setFormState(prev => ({ ...prev, meta_keywords: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Meta Description</label>
              <textarea
                rows={2}
                placeholder="Short SEO description snippet..."
                value={formState.meta_des}
                onChange={(e) => setFormState(prev => ({ ...prev, meta_des: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Custom Scripts */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Custom Scripts</span>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Blog Head Script</label>
              <textarea
                rows={3}
                placeholder="&lt;script&gt;...&lt;/script&gt; or other HTML injected near the top of this post's page"
                value={formState.head_script}
                onChange={(e) => setFormState(prev => ({ ...prev, head_script: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono text-slate-800 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Blog Footer Script</label>
              <textarea
                rows={3}
                placeholder="&lt;script&gt;...&lt;/script&gt; or other HTML injected near the bottom of this post's page"
                value={formState.footer_script}
                onChange={(e) => setFormState(prev => ({ ...prev, footer_script: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Submit Button Bar */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 font-bold">
            <Link
              href="/admin/blogs"
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || isPending}
              className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 transition-all"
            >
              {submitting || isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Post'
              )}
            </button>
          </div>

        </form>

      </div>

    </main>
  );
}
