'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import 'quill/dist/quill.snow.css';
import {
  Activity,
  Search,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Play,
  Heart,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  Disease,
  createDiseaseAction,
  updateDiseaseAction,
  deleteDiseaseAction,
  reorderDiseasesAction
} from '@/app/actions/diseaseActions';

interface DiseasesManagerClientProps {
  initialDiseases: Disease[];
}

interface FocusItem {
  title: string;
  desc: string;
}

interface TestimonialItem {
  caption: string;
  patientName: string;
  comparisonImg: string;
  videoId: string;
  duration: string;
}

export default function DiseasesManagerClient({ initialDiseases }: DiseasesManagerClientProps) {
  const [diseases, setDiseases] = useState<Disease[]>(initialDiseases);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [iconInput, setIconInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [subtitleInput, setSubtitleInput] = useState('');
  const [whatIsTitleInput, setWhatIsTitleInput] = useState('');
  const [bulletsInput, setBulletsInput] = useState(''); // Textarea split by newlines
  const [mainImageInput, setMainImageInput] = useState('');
  const [metaTitleInput, setMetaTitleInput] = useState('');
  const [metaKeywordsInput, setMetaKeywordsInput] = useState('');
  const [metaDesInput, setMetaDesInput] = useState('');
  
  // Dynamic Focus Items
  const [focusItems, setFocusItems] = useState<FocusItem[]>([
    { title: '', desc: '' }
  ]);
  
  // Dynamic Testimonials
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([
    { caption: '', patientName: '', comparisonImg: '', videoId: '', duration: '' }
  ]);

  // Disease Content (rich text)
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [contentInput, setContentInput] = useState('');

  useEffect(() => {
    const initQuill = async () => {
      if (editorRef.current && !quillRef.current) {
        try {
          const QuillClass = (await import('quill')).default;

          quillRef.current = new QuillClass(editorRef.current, {
            theme: 'snow',
            modules: {
              toolbar: [
                [{ header: [1, 2, 3, 4, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ align: [] }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean']
              ]
            }
          });

          quillRef.current.on('text-change', () => {
            const htmlContent = editorRef.current?.querySelector('.ql-editor')?.innerHTML || '';
            setContentInput(htmlContent);
          });
        } catch (err) {
          console.error('Failed to load QuillJS:', err);
        }
      }
    };

    initQuill();
  }, []);

  // Imperatively load HTML into the Quill instance (Quill 2 has no controlled `value` prop)
  const setEditorContent = (html: string) => {
    setContentInput(html);
    if (quillRef.current) {
      quillRef.current.setContents([]);
      if (html) {
        quillRef.current.clipboard.dangerouslyPasteHTML(html);
      }
    }
  };

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Stats
  const totalDiseases = diseases.length;

  // Auto-generate details from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNameInput(name);
    
    if (!isEditing) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlugInput(generatedSlug);
      setTitleInput(`${name} Treatment`);
      setSubtitleInput(`Holistic Ayurvedic Care and Natural Healing for ${name}`);
      setWhatIsTitleInput(`What is ${name}?`);
      setMetaTitleInput(`${name} Ayurvedic Treatment & Reversal Hospital`);
      setMetaKeywordsInput(`${name.toLowerCase()}, ${name.toLowerCase()} treatment, ayurveda, herbal cure`);
      setMetaDesInput(`Consult expert doctors for safe, natural, and root-cause Ayurvedic treatment for ${name.toLowerCase()} at Karma Ayurveda. Call today.`);
    }
  };

  // Focus Items Handlers
  const handleAddFocus = () => {
    setFocusItems(prev => [...prev, { title: '', desc: '' }]);
  };

  const handleRemoveFocus = (index: number) => {
    setFocusItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleFocusChange = (index: number, field: keyof FocusItem, value: string) => {
    setFocusItems(prev => 
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  // Testimonials Handlers
  const handleAddTestimonial = () => {
    setTestimonials(prev => [
      ...prev, 
      { caption: '', patientName: '', comparisonImg: '', videoId: '', duration: '' }
    ]);
  };

  const handleRemoveTestimonial = (index: number) => {
    setTestimonials(prev => prev.filter((_, i) => i !== index));
  };

  const handleTestimonialChange = (index: number, field: keyof TestimonialItem, value: string) => {
    setTestimonials(prev =>
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!nameInput.trim() || !slugInput.trim() || !iconInput.trim() || !descInput.trim()) {
      setError('Name, slug, icon, and list description are required fields.');
      setSubmitting(false);
      return;
    }

    // Process bullets
    const bulletsArray = bulletsInput
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean);

    // Process focus items (filter out empty titles)
    const activeFocus = focusItems.filter(item => item.title.trim() !== '');

    // Process testimonials (filter out empty patientNames)
    const activeTestimonials = testimonials.filter(item => item.patientName.trim() !== '');

    const payload = {
      name: nameInput.trim(),
      slug: slugInput.trim(),
      icon: iconInput.trim(),
      description: descInput.trim(),
      title: titleInput.trim() || `${nameInput.trim()} Treatment`,
      subtitle: subtitleInput.trim() || 'Holistic Ayurvedic Care and Natural Healing',
      what_is_title: whatIsTitleInput.trim() || `What is ${nameInput.trim()}?`,
      bullets: JSON.stringify(bulletsArray),
      main_image: mainImageInput.trim() || 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
      treatment_focus: JSON.stringify(activeFocus),
      testimonials: JSON.stringify(activeTestimonials),
      content: contentInput === '<p><br></p>' ? '' : contentInput,
      meta_title: metaTitleInput.trim() || titleInput.trim(),
      meta_keywords: metaKeywordsInput.trim() || `${nameInput.toLowerCase()}, treatment, ayurveda`,
      meta_des: metaDesInput.trim() || descInput.trim()
    };

    try {
      if (isEditing && editingId) {
        // Edit Action
        const result = await updateDiseaseAction(editingId, payload);
        if (result.success) {
          setSuccess('Disease updated successfully!');
          setDiseases(prev =>
            prev.map(d =>
              d.id === editingId
                ? { ...d, ...payload, id: Number(editingId) }
                : d
            )
          );
          handleCancelEdit();
        } else {
          setError(result.error || 'Failed to update disease.');
        }
      } else {
        // Create Action
        const result = await createDiseaseAction(payload);
        if (result.success) {
          setSuccess('Disease created successfully!');

          // Re-fetch or add client-side dynamic placeholder (appended to the end, matching sort_order)
          const tempId = Date.now().toString();
          setDiseases(prev => [
            ...prev,
            { ...payload, id: parseInt(tempId) || 0 }
          ]);

          resetForm();
        } else {
          setError(result.error || 'Failed to create disease.');
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

  const resetForm = () => {
    setNameInput('');
    setSlugInput('');
    setIconInput('');
    setDescInput('');
    setTitleInput('');
    setSubtitleInput('');
    setWhatIsTitleInput('');
    setBulletsInput('');
    setMainImageInput('');
    setMetaTitleInput('');
    setMetaKeywordsInput('');
    setMetaDesInput('');
    setFocusItems([{ title: '', desc: '' }]);
    setTestimonials([{ caption: '', patientName: '', comparisonImg: '', videoId: '', duration: '' }]);
    setEditorContent('');
  };

  // Start Editing
  const handleStartEdit = (disease: Disease) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(disease.id);

    setNameInput(disease.name);
    setSlugInput(disease.slug);
    setIconInput(disease.icon);
    setDescInput(disease.description);
    setTitleInput(disease.title);
    setSubtitleInput(disease.subtitle);
    setWhatIsTitleInput(disease.what_is_title);
    setMainImageInput(disease.main_image);
    setMetaTitleInput(disease.meta_title || '');
    setMetaKeywordsInput(disease.meta_keywords || '');
    setMetaDesInput(disease.meta_des || '');

    // Bullets (join array to strings with newlines)
    try {
      const arr = JSON.parse(disease.bullets) as string[];
      setBulletsInput(arr.join('\n'));
    } catch {
      setBulletsInput('');
    }

    // Focus items
    try {
      const focusArr = JSON.parse(disease.treatment_focus) as FocusItem[];
      setFocusItems(focusArr.length > 0 ? focusArr : [{ title: '', desc: '' }]);
    } catch {
      setFocusItems([{ title: '', desc: '' }]);
    }

    // Testimonials
    try {
      const testArr = JSON.parse(disease.testimonials) as TestimonialItem[];
      setTestimonials(testArr.length > 0 ? testArr : [{ caption: '', patientName: '', comparisonImg: '', videoId: '', duration: '' }]);
    } catch {
      setTestimonials([{ caption: '', patientName: '', comparisonImg: '', videoId: '', duration: '' }]);
    }

    // Disease Content (rich text)
    setEditorContent(disease.content || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  // Delete disease
  const handleDelete = async (disease: Disease) => {
    if (!confirm(`Are you sure you want to delete "${disease.name}"? This will permanently remove its public treatment detail page.`)) return;

    setError(null);
    setSuccess(null);

    const originalDiseases = [...diseases];
    setDiseases(prev => prev.filter(d => d.id !== disease.id));

    const result = await deleteDiseaseAction(disease.id);
    if (result.success) {
      setSuccess('Disease deleted successfully.');
      startTransition(() => {});
    } else {
      setError(result.error || 'Failed to delete disease.');
      setDiseases(originalDiseases);
    }
  };

  // Reorder disease (swap with the adjacent row, then persist the full new order)
  const handleMove = async (disease: Disease, direction: 'up' | 'down') => {
    const currentIndex = diseases.findIndex(d => d.id === disease.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= diseases.length) return;

    const reordered = [...diseases];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];

    const originalDiseases = diseases;
    setDiseases(reordered);

    const result = await reorderDiseasesAction(reordered.map(d => d.id));
    if (!result.success) {
      setError(result.error || 'Failed to save the new order.');
      setDiseases(originalDiseases);
    }
  };

  // Filter
  const filteredDiseases = diseases.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Disease Management</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-650/10">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Disease Management</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage medical conditions and customized treatment pathways</p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: List Directory (2/3 width on large screens) */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex flex-col px-3">
              <span className="text-xs font-black text-slate-700">Disease Directory ({filteredDiseases.length})</span>
              {searchQuery.trim() !== '' && (
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">Clear search to reorder</span>
              )}
            </div>
            <div className="relative group w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search diseases..."
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
                    <th className="py-4 px-5 w-14">Order</th>
                    <th className="py-4 px-5">Disease</th>
                    <th className="py-4 px-5">URL Path</th>
                    <th className="py-4 px-5 text-center">Focus Pillars</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {filteredDiseases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-405">
                        <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No diseases found.
                      </td>
                    </tr>
                  ) : (
                    filteredDiseases.map((dis) => {
                      let pillarsCount = 0;
                      try {
                        pillarsCount = JSON.parse(dis.treatment_focus || '[]').length;
                      } catch {}
                      const canReorder = searchQuery.trim() === '';
                      const fullIndex = diseases.findIndex(d => d.id === dis.id);
                      const isFirst = fullIndex <= 0;
                      const isLast = fullIndex === diseases.length - 1;
                      return (
                        <tr key={dis.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => handleMove(dis, 'up')}
                                disabled={!canReorder || isFirst}
                                className="p-0.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
                                title={canReorder ? 'Move Up' : 'Clear search to reorder'}
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMove(dis, 'down')}
                                disabled={!canReorder || isLast}
                                className="p-0.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
                                title={canReorder ? 'Move Down' : 'Clear search to reorder'}
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0 text-base">
                                {dis.icon}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 block">{dis.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[240px]">
                                  {dis.description}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-mono text-slate-400 text-[11px]">/{dis.slug}</span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                              {pillarsCount} Pillars
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleStartEdit(dis)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Disease"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(dis)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Disease"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Editor Panel (1/3 width) */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-6 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* Editor Header */}
            <div>
              <h3 className="font-black text-sm text-slate-950 tracking-tight flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isEditing ? 'bg-orange-500' : 'bg-emerald-650'}`}></div>
                {isEditing ? 'Edit Disease' : 'Add New Disease'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                {isEditing ? 'Update medical info, focus plans, and success videos' : 'Define new medical condition details'}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Basic Fields Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Migraine"
                    value={nameInput}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">URL Slug*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. migraine"
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Icon Emoji*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🧠"
                    value={iconInput}
                    onChange={(e) => setIconInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-center text-sm bg-white font-semibold text-slate-800"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Featured Image URL</label>
                  <input
                    type="text"
                    placeholder="Unsplash / local image path"
                    value={mainImageInput}
                    onChange={(e) => setMainImageInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Short list Description*</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Summarize the condition and Ayurvedic approach in 2-3 sentences..."
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Detail Page Fields */}
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Page Info</div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Banner Title</label>
                <input
                  type="text"
                  placeholder="e.g. Migraine Treatment"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Banner Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Holistic Ayurvedic Therapies..."
                  value={subtitleInput}
                  onChange={(e) => setSubtitleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">"What is" Header</label>
                <input
                  type="text"
                  placeholder="e.g. What Is Migraine?"
                  value={whatIsTitleInput}
                  onChange={(e) => setWhatIsTitleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">What is Bullets (One per line)</label>
                <textarea
                  rows={4}
                  placeholder="First bullet description&#10;Second bullet description..."
                  value={bulletsInput}
                  onChange={(e) => setBulletsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Disease Content</label>
                <p className="text-[10px] font-medium text-slate-400 -mt-0.5 mb-1">
                  Rich body content shown on the public page, right after "Treatments We Offer".
                </p>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div ref={editorRef} className="h-64 text-xs text-slate-800 font-medium"></div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Dynamic Focus Editor */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treatment Focus Areas</span>
                <button
                  type="button"
                  onClick={handleAddFocus}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 px-2 py-1 rounded cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Focus
                </button>
              </div>
              <div className="space-y-3">
                {focusItems.map((item, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 relative space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400">Pillar #{idx + 1}</span>
                      {focusItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFocus(idx)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Title (e.g. Blood Purifying)"
                      value={item.title}
                      onChange={(e) => handleFocusChange(idx, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-bold text-slate-700"
                    />
                    <textarea
                      rows={2}
                      placeholder="Focus description..."
                      value={item.desc}
                      onChange={(e) => handleFocusChange(idx, 'desc', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-medium text-slate-600 resize-none"
                    />
                  </div>
                ))}
              </div>

              <hr className="border-slate-100" />

              {/* Dynamic Testimonials Editor */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video Testimonials</span>
                <button
                  type="button"
                  onClick={handleAddTestimonial}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-[#d2621a] hover:text-[#c2520a] bg-orange-50 hover:bg-orange-100/70 px-2 py-1 rounded cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Video
                </button>
              </div>
              <div className="space-y-3">
                {testimonials.map((item, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 relative space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400">Video #{idx + 1}</span>
                      {testimonials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestimonial(idx)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Patient Name"
                        value={item.patientName}
                        onChange={(e) => handleTestimonialChange(idx, 'patientName', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-700"
                      />
                      <input
                        type="text"
                        placeholder="Video Caption"
                        value={item.caption}
                        onChange={(e) => handleTestimonialChange(idx, 'caption', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="YouTube Video ID"
                        value={item.videoId}
                        onChange={(e) => handleTestimonialChange(idx, 'videoId', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono text-slate-700"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 4:15)"
                        value={item.duration}
                        onChange={(e) => handleTestimonialChange(idx, 'duration', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Comparison Image Path"
                      value={item.comparisonImg}
                      onChange={(e) => handleTestimonialChange(idx, 'comparisonImg', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
                    />
                  </div>
                ))}
              </div>

              <hr className="border-slate-100" />

              {/* SEO Meta Fields */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">SEO Configurations</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Meta Title</label>
                  <input
                    type="text"
                    placeholder="SEO Page Title"
                    value={metaTitleInput}
                    onChange={(e) => setMetaTitleInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Meta Keywords</label>
                  <input
                    type="text"
                    placeholder="comma-separated tags..."
                    value={metaKeywordsInput}
                    onChange={(e) => setMetaKeywordsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Meta Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short SEO page description snippet..."
                    value={metaDesInput}
                    onChange={(e) => setMetaDesInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 font-bold">
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
                      {isEditing ? 'Update Condition' : 'Create Condition'}
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
