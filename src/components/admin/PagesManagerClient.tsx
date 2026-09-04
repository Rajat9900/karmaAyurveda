'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Trash2, 
  Edit, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  ChevronLeft
} from 'lucide-react';
import { 
  PageItem,
  createPageAction, 
  updatePageAction, 
  deletePageAction 
} from '@/app/actions/pageActions';

// Import Quill snow stylesheet
import 'quill/dist/quill.snow.css';

interface PagesManagerClientProps {
  initialPages: PageItem[];
}

export default function PagesManagerClient({ initialPages }: PagesManagerClientProps) {
  const [pages, setPages] = useState<PageItem[]>(initialPages);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Views: 'list' or 'form'
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [initialDescription, setInitialDescription] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  // Quill initialization
  useEffect(() => {
    if (view === 'form' && editorRef.current && !quillRef.current) {
      const initQuill = async () => {
        try {
          const QuillClass = (await import('quill')).default;
          quillRef.current = new QuillClass(editorRef.current!, {
            theme: 'snow',
            modules: {
              toolbar: [
                [{ header: [1, 2, 3, 4, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
              ]
            }
          });

          // Set initial HTML
          if (initialDescription) {
            quillRef.current.clipboard.dangerouslyPasteHTML(initialDescription);
          }

          // Listen to changes
          quillRef.current.on('text-change', () => {
            const htmlContent = editorRef.current?.querySelector('.ql-editor')?.innerHTML || '';
            setDescriptionInput(htmlContent);
          });
        } catch (err) {
          console.error('Failed to load QuillJS:', err);
        }
      };

      initQuill();
    }

    // Reset quillRef on view change back to list
    return () => {
      if (view === 'list') {
        quillRef.current = null;
      }
    };
  }, [view, initialDescription]);

  // Handle title input change, auto-generating slug in create mode
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNameInput(name);
    
    // Auto-generate slug if not editing
    if (!isEditing) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-')       // replace spaces with dashes
        .replace(/-+/g, '-');        // reduce multiple dashes
      setSlugInput(generatedSlug);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!nameInput.trim() || !slugInput.trim() || !descriptionInput.trim() || descriptionInput === '<p><br></p>') {
      setError('Name, Slug, and Description are required fields.');
      setSubmitting(false);
      return;
    }

    const payload = {
      name: nameInput.trim(),
      slug: slugInput.trim(),
      description: descriptionInput.trim()
    };

    try {
      if (isEditing && editingId) {
        // Edit Action
        const result = await updatePageAction(editingId, payload);
        if (result.success) {
          setSuccess('Page updated successfully!');
          
          setPages(prev => 
            prev.map(p => 
              p.id === editingId 
                ? { ...p, ...payload, updated_at: new Date().toISOString() } 
                : p
            ).sort((a, b) => a.name.localeCompare(b.name))
          );
          
          // Delayed return to list view
          setTimeout(() => {
            handleCancel();
          }, 1000);
        } else {
          setError(result.error || 'Failed to update page.');
        }
      } else {
        // Create Action
        const result = await createPageAction(payload);
        if (result.success) {
          setSuccess('Page created successfully!');
          
          const tempId = Date.now().toString();
          setPages(prev => [
            ...prev, 
            { 
              ...payload, 
              id: parseInt(tempId) || 0,
              updated_at: new Date().toISOString()
            }
          ].sort((a, b) => a.name.localeCompare(b.name)));
          
          // Delayed return to list view
          setTimeout(() => {
            handleCancel();
          }, 1000);
        } else {
          setError(result.error || 'Failed to create page.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
      startTransition(() => {});
    }
  };

  // Start Adding
  const handleStartAdd = () => {
    setError(null);
    setSuccess(null);
    setIsEditing(false);
    setEditingId(null);
    
    setNameInput('');
    setSlugInput('');
    setDescriptionInput('');
    setInitialDescription('');
    
    setView('form');
  };

  // Start Editing
  const handleStartEdit = (page: PageItem) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(page.id);

    setNameInput(page.name);
    setSlugInput(page.slug);
    setDescriptionInput(page.description);
    setInitialDescription(page.description);

    setView('form');
  };

  const handleCancel = () => {
    setView('list');
    setIsEditing(false);
    setEditingId(null);
    setNameInput('');
    setSlugInput('');
    setDescriptionInput('');
    setInitialDescription('');
  };

  // Delete Page
  const handleDelete = async (page: PageItem) => {
    if (!confirm(`Are you sure you want to delete the page "${page.name}"?`)) return;

    setError(null);
    setSuccess(null);

    const originalPages = [...pages];
    setPages(prev => prev.filter(p => p.id !== page.id));

    const result = await deletePageAction(page.id);
    if (result.success) {
      setSuccess('Page deleted successfully.');
      startTransition(() => {});
    } else {
      setError(result.error || 'Failed to delete page.');
      setPages(originalPages);
    }
  };

  // Filter
  const filteredPages = pages.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Custom Pages</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-650/10">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Custom Pages</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage rich-content policies, T&C, disclaimer, and informational pages</p>
          </div>
        </div>

        {view === 'list' && (
          <button
            onClick={handleStartAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer border-none"
          >
            <PlusCircle className="w-4 h-4" />
            Add Page
          </button>
        )}
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

      {/* Views Toggle */}
      {view === 'list' ? (
        <div className="space-y-4">
          
          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 px-3">Pages List ({filteredPages.length})</span>
            <div className="relative group w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search pages..."
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
                    <th className="py-4 px-5">Slug</th>
                    <th className="py-4 px-5">Last Updated</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {filteredPages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No pages found.
                      </td>
                    </tr>
                  ) : (
                    filteredPages.map((page) => (
                      <tr key={page.id} className="hover:bg-slate-50/50 transition-colors align-middle">
                        
                        {/* Column 1: Name */}
                        <td className="py-4 px-5">
                          <span className="font-extrabold text-slate-900 text-sm leading-snug block">{page.name}</span>
                        </td>

                        {/* Column 2: Slug */}
                        <td className="py-4 px-5">
                          <span className="font-mono text-slate-500 text-xs bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                            /{page.slug}
                          </span>
                        </td>

                        {/* Column 3: Last Updated */}
                        <td className="py-4 px-5 text-slate-400 text-xs">
                          {page.updated_at ? new Date(page.updated_at).toLocaleString() : 'N/A'}
                        </td>

                        {/* Column 4: Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(page)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                              title="Edit Page Content"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(page)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                              title="Delete Page"
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
      ) : (
        /* Full-Width Form View */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          
          {/* Back Navigation & Header */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all cursor-pointer text-slate-500 hover:text-slate-800 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="font-black text-sm text-slate-950 tracking-tight flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isEditing ? 'bg-orange-500' : 'bg-emerald-650'}`}></div>
                {isEditing ? `Edit Page: ${nameInput}` : 'Add New Page'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                {isEditing ? 'Update custom page content and properties' : 'Register a new custom information page'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Page Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Page Name*</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Return Policy"
                  value={nameInput}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              {/* Page Slug */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Page Slug*</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. return-policy"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono font-bold text-slate-800"
                />
              </div>

            </div>

            {/* Quill Text Editor */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description Content*</label>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div 
                  ref={editorRef} 
                  className="bg-white min-h-[350px] text-xs font-semibold text-slate-800"
                  style={{ fontSize: '13px' }}
                ></div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-5 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer text-slate-650 bg-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isPending}
                className={`px-5 py-2.5 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60 transition-all border-none ${
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
                    {isEditing ? 'Update Page' : 'Create Page'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

    </main>
  );
}
