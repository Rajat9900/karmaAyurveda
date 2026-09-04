'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import 'quill/dist/quill.snow.css';
import {
  Stethoscope,
  Search,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Link2,
  Image as ImageIcon
} from 'lucide-react';
import {
  Therapy,
  createTherapyAction,
  updateTherapyAction,
  deleteTherapyAction,
  uploadTherapyImageAction
} from '@/app/actions/therapyActions';
import { Disease } from '@/app/actions/diseaseActions';

interface TherapiesManagerClientProps {
  initialTherapies: Therapy[];
  diseasesList: Disease[];
}

export default function TherapiesManagerClient({ initialTherapies, diseasesList }: TherapiesManagerClientProps) {
  const [therapies, setTherapies] = useState<Therapy[]>(initialTherapies);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [imageInput, setImageInput] = useState(''); // existing/uploaded image URL
  const [imageFile, setImageFile] = useState<File | null>(null); // pending local file selection
  const [imageAltInput, setImageAltInput] = useState('');
  const [shortDesInput, setShortDesInput] = useState('');
  const [longDesInput, setLongDesInput] = useState('');
  const [metaTitleInput, setMetaTitleInput] = useState('');
  const [metaKeywordsInput, setMetaKeywordsInput] = useState('');
  const [metaDesInput, setMetaDesInput] = useState('');
  const [diseaseIdInput, setDiseaseIdInput] = useState<string>('');

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

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
            setLongDesInput(html);
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
    setLongDesInput(html);
    if (quillRef.current) {
      quillRef.current.setContents([]);
      if (html) {
        quillRef.current.clipboard.dangerouslyPasteHTML(html);
      }
    }
  };

  // Helper when name changes to auto-suggest slug, image alt, and meta tags
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
      setImageAltInput(`Ayurvedic ${name} therapy`);
      setMetaTitleInput(`${name} Therapy - Ayurvedic Panchakarma Treatment`);
      setMetaKeywordsInput(`${name.toLowerCase()}, panchakarma, ayurvedic therapy, natural healing`);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const longDesValue = longDesInput === '<p><br></p>' ? '' : longDesInput;

    if (!nameInput.trim() || !slugInput.trim() || !shortDesInput.trim() || !longDesValue.trim()) {
      setError('Name, URL slug, short description, and long description details are required.');
      setSubmitting(false);
      return;
    }

    let finalImage = imageInput;
    if (imageFile) {
      const uploadData = new FormData();
      uploadData.append('image', imageFile);
      const uploadResult = await uploadTherapyImageAction(uploadData);
      if (!uploadResult.success) {
        setError(uploadResult.error || 'Failed to upload image.');
        setSubmitting(false);
        return;
      }
      finalImage = uploadResult.url || '';
    }

    const diseaseId = diseaseIdInput ? parseInt(diseaseIdInput) : null;
    const selectedDisease = diseasesList.find(d => d.id.toString() === diseaseIdInput);

    const payload = {
      name: nameInput.trim(),
      slug: slugInput.trim().toLowerCase().replace(/\s+/g, '-'),
      image: finalImage || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
      image_alt: imageAltInput.trim() || nameInput.trim(),
      short_des: shortDesInput.trim(),
      long_des: longDesValue,
      meta_title: metaTitleInput.trim() || nameInput.trim(),
      meta_keywords: metaKeywordsInput.trim(),
      meta_des: metaDesInput.trim() || shortDesInput.trim(),
      disease_id: diseaseId
    };

    try {
      if (isEditing && editingId) {
        // Edit Action
        const result = await updateTherapyAction(editingId, payload);
        if (result.success) {
          setSuccess('Therapy profile updated successfully!');
          
          setTherapies(prev => 
            prev.map(t => 
              t.id === editingId 
                ? { 
                    ...t, 
                    ...payload, 
                    disease_name: selectedDisease ? selectedDisease.name : undefined 
                  } 
                : t
            )
          );
          handleCancelEdit();
        } else {
          setError(result.error || 'Failed to update therapy.');
        }
      } else {
        // Create Action
        const result = await createTherapyAction(payload);
        if (result.success) {
          setSuccess('Therapy profile created successfully!');
          
          const tempId = Date.now().toString();
          setTherapies(prev => [
            ...prev, 
            { 
              ...payload, 
              id: parseInt(tempId) || 0,
              disease_name: selectedDisease ? selectedDisease.name : undefined
            }
          ].sort((a, b) => a.name.localeCompare(b.name)));
          
          resetForm();
        } else {
          setError(result.error || 'Failed to create therapy.');
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
    setImageInput('');
    setImageFile(null);
    setImageAltInput('');
    setShortDesInput('');
    setEditorContent('');
    setMetaTitleInput('');
    setMetaKeywordsInput('');
    setMetaDesInput('');
    setDiseaseIdInput('');
  };

  // Start Editing
  const handleStartEdit = (th: Therapy) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(th.id);

    setNameInput(th.name);
    setSlugInput(th.slug || '');
    setImageInput(th.image);
    setImageFile(null);
    setImageAltInput(th.image_alt);
    setShortDesInput(th.short_des);
    setEditorContent(th.long_des || '');
    setMetaTitleInput(th.meta_title);
    setMetaKeywordsInput(th.meta_keywords);
    setMetaDesInput(th.meta_des);
    setDiseaseIdInput(th.disease_id ? th.disease_id.toString() : '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  // Delete therapy
  const handleDelete = async (th: Therapy) => {
    if (!confirm(`Are you sure you want to delete the therapy "${th.name}"? This action is permanent.`)) return;

    setError(null);
    setSuccess(null);

    const originalTherapies = [...therapies];
    setTherapies(prev => prev.filter(t => t.id !== th.id));

    const result = await deleteTherapyAction(th.id);
    if (result.success) {
      setSuccess('Therapy profile deleted successfully.');
      startTransition(() => {});
    } else {
      setError(result.error || 'Failed to delete therapy.');
      setTherapies(originalTherapies);
    }
  };

  // Filter
  const filteredTherapies = therapies.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.short_des.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Panchkarma Therapy</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-650/10">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Therapy Management</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage classical Ayurvedic Panchkarma therapies and target conditions</p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Data Table (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 px-3">Therapies List ({filteredTherapies.length})</span>
            <div className="relative group w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search therapies..."
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
                    <th className="py-4 px-5">Therapy</th>
                    <th className="py-4 px-5">URL Path</th>
                    <th className="py-4 px-5">Image & Alt</th>
                    <th className="py-4 px-5">Target Disease</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {filteredTherapies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Stethoscope className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No therapies found.
                      </td>
                    </tr>
                  ) : (
                    filteredTherapies.map((th) => (
                      <tr key={th.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Column 1: Therapy Name & Description */}
                        <td className="py-4 px-5">
                          <div>
                            <span className="font-extrabold text-slate-900 block text-sm">{th.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium line-clamp-2 max-w-[280px] mt-0.5 leading-relaxed">
                              {th.short_des}
                            </span>
                          </div>
                        </td>

                        {/* Column 2: URL Slug */}
                        <td className="py-4 px-5">
                          <span className="font-mono text-slate-400 text-[11px]">/{th.slug}</span>
                        </td>

                        {/* Column 3: Image Thumbnail */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-12 h-8 rounded-lg overflow-hidden border border-slate-150 flex-shrink-0 bg-slate-50 shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={th.image} alt={th.image_alt} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] text-slate-450 font-mono font-bold max-w-[120px] truncate block" title={th.image_alt}>
                              {th.image_alt}
                            </span>
                          </div>
                        </td>

                        {/* Column 4: Linked Disease */}
                        <td className="py-4 px-5">
                          {th.disease_name ? (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-green-150">
                              <Link2 className="w-3 h-3 text-green-550" /> {th.disease_name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic font-medium">Not Linked</span>
                          )}
                        </td>

                        {/* Column 5: Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(th)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Therapy"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(th)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Therapy"
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

        {/* Right Column: Editor Panel (1/3 width) */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* Editor Header */}
            <div>
              <h3 className="font-black text-sm text-slate-950 tracking-tight flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isEditing ? 'bg-orange-500' : 'bg-emerald-650'}`}></div>
                {isEditing ? 'Edit Therapy' : 'Add New Therapy'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                {isEditing ? 'Modify classical Panchkarma details and meta properties' : 'Define a new therapeutic cleansing program'}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Therapy Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virechana"
                  value={nameInput}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">URL Slug*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. virechana"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Therapy Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imageFile ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={URL.createObjectURL(imageFile)} alt={nameInput} className="w-full h-full object-cover" />
                    ) : imageInput ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageInput} alt={nameInput} className="w-full h-full object-cover" />
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
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Image Alt Tag</label>
                <input
                  type="text"
                  placeholder="Describe image context..."
                  value={imageAltInput}
                  onChange={(e) => setImageAltInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Target Disease Condition</label>
                <select
                  value={diseaseIdInput}
                  onChange={(e) => setDiseaseIdInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 appearance-none"
                >
                  <option value="">-- No Linked Condition --</option>
                  {diseasesList.map(disease => (
                    <option key={disease.id} value={disease.id}>
                      {disease.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Short Description* (for listing cards)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Summarize key therapy goals..."
                  value={shortDesInput}
                  onChange={(e) => setShortDesInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Long Description / Procedure*</label>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div ref={editorRef} className="h-56 text-xs text-slate-800 font-medium"></div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* SEO Tags Group */}
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" /> SEO / Meta Information
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Meta Title</label>
                <input
                  type="text"
                  placeholder="Suggested auto-generated title"
                  value={metaTitleInput}
                  onChange={(e) => setMetaTitleInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Meta Keywords</label>
                <input
                  type="text"
                  placeholder="comma separated values..."
                  value={metaKeywordsInput}
                  onChange={(e) => setMetaKeywordsInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Meta Description</label>
                <textarea
                  rows={2}
                  placeholder="Keep under 160 characters..."
                  value={metaDesInput}
                  onChange={(e) => setMetaDesInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none font-sans"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
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
                      {isEditing ? 'Update Therapy' : 'Create Therapy'}
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
