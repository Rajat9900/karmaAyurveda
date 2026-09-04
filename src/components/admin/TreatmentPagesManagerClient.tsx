'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import 'quill/dist/quill.snow.css';
import {
  Layers,
  Search,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';
import {
  DiseaseTreatmentWithDisease,
  createDiseaseTreatmentAction,
  updateDiseaseTreatmentAction,
  deleteDiseaseTreatmentAction
} from '@/app/actions/diseaseTreatmentActions';
import { Disease, uploadDiseaseTreatmentImageAction } from '@/app/actions/diseaseActions';

interface TreatmentPagesManagerClientProps {
  initialTreatments: DiseaseTreatmentWithDisease[];
  diseases: Disease[];
}

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

export default function TreatmentPagesManagerClient({ initialTreatments, diseases }: TreatmentPagesManagerClientProps) {
  const [treatments, setTreatments] = useState<DiseaseTreatmentWithDisease[]>(initialTreatments);
  const [searchQuery, setSearchQuery] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [diseaseIdInput, setDiseaseIdInput] = useState<number | ''>(diseases[0]?.id ?? '');
  const [titleInput, setTitleInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [shortDescInput, setShortDescInput] = useState('');
  const [metaTitleInput, setMetaTitleInput] = useState('');
  const [metaDesInput, setMetaDesInput] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [contentInput, setContentInput] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

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
            const html = editorRef.current?.querySelector('.ql-editor')?.innerHTML || '';
            setContentInput(html);
          });
        } catch (err) {
          console.error('Failed to load QuillJS:', err);
        }
      }
    };
    initQuill();
  }, []);

  const setEditorContent = (html: string) => {
    setContentInput(html);
    if (quillRef.current) {
      quillRef.current.setContents([]);
      if (html) {
        quillRef.current.clipboard.dangerouslyPasteHTML(html);
      }
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setTitleInput(title);
    if (!isEditing) {
      setSlugInput(slugify(title));
      setMetaTitleInput(`${title} | Ayurvedic Treatment`);
    }
  };

  const resetForm = () => {
    setDiseaseIdInput(diseases[0]?.id ?? '');
    setTitleInput('');
    setSlugInput('');
    setImageInput('');
    setImageFile(null);
    setShortDescInput('');
    setMetaTitleInput('');
    setMetaDesInput('');
    setEditorContent('');
  };

  const handleStartEdit = (item: DiseaseTreatmentWithDisease) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(item.id);
    setDiseaseIdInput(item.disease_id);
    setTitleInput(item.title);
    setSlugInput(item.slug);
    setImageInput(item.image || '');
    setImageFile(null);
    setShortDescInput(item.short_description || '');
    setMetaTitleInput(item.meta_title || '');
    setMetaDesInput(item.meta_des || '');
    setEditorContent(item.content || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!diseaseIdInput || !titleInput.trim() || !slugInput.trim()) {
      setError('Disease, title, and slug are required fields.');
      setSubmitting(false);
      return;
    }

    let finalImage = imageInput;
    if (imageFile) {
      const uploadData = new FormData();
      uploadData.append('image', imageFile);
      const uploadResult = await uploadDiseaseTreatmentImageAction(uploadData);
      if (!uploadResult.success) {
        setError(uploadResult.error || 'Failed to upload image.');
        setSubmitting(false);
        return;
      }
      finalImage = uploadResult.url || '';
    }

    const payload = {
      disease_id: Number(diseaseIdInput),
      title: titleInput.trim(),
      slug: slugInput.trim().toLowerCase().replace(/\s+/g, '-'),
      image: finalImage,
      short_description: shortDescInput.trim(),
      content: contentInput === '<p><br></p>' ? '' : contentInput,
      meta_title: metaTitleInput.trim() || `${titleInput.trim()} | Ayurvedic Treatment`,
      meta_des: metaDesInput.trim() || shortDescInput.trim(),
      sort_order: 0
    };

    try {
      if (isEditing && editingId) {
        const result = await updateDiseaseTreatmentAction(editingId, payload);
        if (result.success) {
          setSuccess('Treatment page updated successfully!');
          const disease = diseases.find(d => d.id === payload.disease_id);
          setTreatments(prev =>
            prev.map(t => t.id === editingId
              ? { ...t, ...payload, id: Number(editingId), disease_name: disease?.name || t.disease_name, disease_slug: disease?.slug || t.disease_slug }
              : t)
          );
          handleCancelEdit();
        } else {
          setError(result.error || 'Failed to update treatment page.');
        }
      } else {
        const result = await createDiseaseTreatmentAction(payload);
        if (result.success) {
          setSuccess('Treatment page created successfully!');
          const disease = diseases.find(d => d.id === payload.disease_id);
          const tempId = Date.now();
          setTreatments(prev => [
            ...prev,
            { ...payload, id: tempId, disease_name: disease?.name || '', disease_slug: disease?.slug || '' }
          ].sort((a, b) => a.disease_name.localeCompare(b.disease_name) || a.title.localeCompare(b.title)));
          resetForm();
        } else {
          setError(result.error || 'Failed to create treatment page.');
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

  const handleDelete = async (item: DiseaseTreatmentWithDisease) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"? Its public page at /${item.slug} will stop working.`)) return;

    setError(null);
    setSuccess(null);

    const original = [...treatments];
    setTreatments(prev => prev.filter(t => t.id !== item.id));

    const result = await deleteDiseaseTreatmentAction(item.id);
    if (result.success) {
      setSuccess('Treatment page deleted successfully.');
      startTransition(() => {});
    } else {
      setError(result.error || 'Failed to delete treatment page.');
      setTreatments(original);
    }
  };

  const filteredTreatments = treatments.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.disease_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">

      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Treatment Pages</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-650/10">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Treatment Pages</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage the individual sub-pages linked from each disease's "Treatments We Offer" cards</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column: List Directory */}
        <div className="xl:col-span-2 space-y-4">

          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 px-3">Treatment Directory ({filteredTreatments.length})</span>
            <div className="relative group w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search treatment pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs bg-white text-slate-700 placeholder:text-slate-400 font-semibold"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-600">
                <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Treatment</th>
                    <th className="py-4 px-5">Disease</th>
                    <th className="py-4 px-5">URL</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {filteredTreatments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-405">
                        <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No treatment pages found.
                      </td>
                    </tr>
                  ) : (
                    filteredTreatments.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block">{item.title}</span>
                              {item.short_description && (
                                <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[220px] block">
                                  {item.short_description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-slate-500">{item.disease_name}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-mono text-slate-400 text-[11px]">/{item.slug}</span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Treatment Page"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Treatment Page"
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

        {/* Right Column: Editor Panel */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">

            <div>
              <h3 className="font-black text-sm text-slate-950 tracking-tight flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isEditing ? 'bg-orange-500' : 'bg-emerald-650'}`}></div>
                {isEditing ? 'Edit Treatment Page' : 'Add New Treatment Page'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                {isEditing ? 'Update this sub-page\'s content and details' : 'Create a new sub-page for a disease treatment card'}
              </p>
            </div>

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

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Parent Disease*</label>
                <select
                  required
                  value={diseaseIdInput}
                  onChange={(e) => setDiseaseIdInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                >
                  {diseases.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Title*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kidney Dialysis"
                  value={titleInput}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">URL Slug*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kidney-dialysis"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary shown in previews and used as a fallback meta description..."
                  value={shortDescInput}
                  onChange={(e) => setShortDescInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imageFile ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={URL.createObjectURL(imageFile)} alt={titleInput} className="w-full h-full object-cover" />
                    ) : imageInput ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageInput} alt={titleInput} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="flex-1 text-[10px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Content</label>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div ref={editorRef} className="h-64 text-xs text-slate-800 font-medium"></div>
                </div>
              </div>

              <hr className="border-slate-100" />

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
                      {isEditing ? 'Update Page' : 'Create Page'}
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
