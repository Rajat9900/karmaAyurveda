'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import 'quill/dist/quill.snow.css';
import { Globe, ArrowLeft, Loader2, AlertCircle, Image as ImageIcon, Activity, Search } from 'lucide-react';
import {
  createLocationAction,
  updateLocationAction,
  uploadLocationImageAction,
  setLocationDiseaseLinksAction,
  ServiceLocation
} from '@/app/actions/locationActions';
import { Disease } from '@/app/actions/diseaseActions';

interface LocationFormClientProps {
  editingLocation?: ServiceLocation;
  diseases?: Disease[];
  linkedDiseaseIds?: number[];
}

export default function LocationFormClient({ editingLocation, diseases = [], linkedDiseaseIds = [] }: LocationFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState<number[]>(linkedDiseaseIds);
  const [diseaseSearch, setDiseaseSearch] = useState('');

  const handleToggleDisease = (diseaseId: number) => {
    setSelectedDiseaseIds(prev =>
      prev.includes(diseaseId) ? prev.filter(id => id !== diseaseId) : [...prev, diseaseId]
    );
  };

  const [formState, setFormState] = useState({
    name: editingLocation?.name || '',
    slug: editingLocation?.slug || '',
    title: editingLocation?.title || '',
    city: editingLocation?.city || 'Delhi',
    phone: editingLocation?.phone || '+91-99719-28080',
    email: editingLocation?.email || 'info@karmaayurveda.com',
    address: editingLocation?.address || '',
    map_url: editingLocation?.map_url || '',
    image: editingLocation?.image || ''
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [contentInput, setContentInput] = useState(editingLocation?.content || '');

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
          if (editingLocation?.content) {
            quillRef.current.clipboard.dangerouslyPasteHTML(editingLocation.content);
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingLocation?.image || null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  // Check for test mode parameter to support headless automation runs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('test') === 'true') {
        setIsTestMode(true);
      }
    }
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    setFormState(prev => ({
      ...prev,
      name,
      slug: editingLocation ? prev.slug : generatedSlug
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { name, slug, city, phone, email, address } = formState;

    if (!name || !slug || !city || !phone || !email || !address) {
      setError('Name, Slug, City, Phone, Email, and Address are required fields.');
      setSubmitting(false);
      return;
    }

    if (!editingLocation && !imageFile && !isTestMode) {
      setError('Featured location photo is required.');
      setSubmitting(false);
      return;
    }

    let finalImageUrl = formState.image;

    // 1. Upload image if selected
    if (imageFile) {
      try {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        const uploadResult = await uploadLocationImageAction(uploadData);
        if (!uploadResult.success) {
          setError(uploadResult.error || 'Failed to upload location image.');
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
    } else if (isTestMode && !editingLocation) {
      finalImageUrl = '/upload/locations/mock-location.png';
    }

    const locationPayload = {
      ...formState,
      content: contentInput === '<p><br></p>' ? '' : contentInput,
      image: finalImageUrl
    };

    try {
      if (editingLocation) {
        // Update Action
        const result = await updateLocationAction(editingLocation.id, locationPayload);
        if (result.success) {
          await setLocationDiseaseLinksAction(editingLocation.id, selectedDiseaseIds);
          startTransition(() => {
            router.push('/admin/locations-we-serve');
            router.refresh();
          });
        } else {
          setError(result.error || 'Failed to update location.');
          setSubmitting(false);
        }
      } else {
        // Create Action
        const result = await createLocationAction(locationPayload);
        if (result.success) {
          if (result.id) {
            await setLocationDiseaseLinksAction(result.id, selectedDiseaseIds);
          }
          startTransition(() => {
            router.push('/admin/locations-we-serve');
            router.refresh();
          });
        } else {
          setError(result.error || 'Failed to create location.');
          setSubmitting(false);
        }
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected server error occurred while saving the location.');
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">

      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <Link href="/admin/locations-we-serve" className="hover:text-slate-650">Other Locations We Serve</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">{editingLocation ? 'Edit' : 'Add'}</span>
      </div>

      {/* Page Title & Cancel Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/10">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {editingLocation ? 'Update existing service area details and contacts' : 'Register a new area or city Karma Ayurveda serves'}
            </p>
          </div>
        </div>

        <Link
          href="/admin/locations-we-serve"
          className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-6">

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs font-bold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Location Name Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location Name*</label>
            <input
              type="text"
              required
              placeholder="e.g. Lucknow - Vikas Nagar"
              value={formState.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
            />
          </div>

          {/* Slug Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">URL Slug (Auto-generated)*</label>
            <input
              type="text"
              required
              placeholder="e.g. lucknow-vikas-nagar"
              value={formState.slug}
              onChange={(e) => setFormState(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs transition-all bg-white font-mono font-bold text-slate-800"
            />
          </div>

          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Page Title</label>
            <input
              type="text"
              placeholder="e.g. Best Kidney Treatment in Lucknow"
              value={formState.title}
              onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Content</label>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div ref={editorRef} className="h-64 text-xs text-slate-800 font-medium"></div>
            </div>
          </div>

          {/* Linked Diseases */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5" />
              Linked Diseases
            </div>
            <p className="text-[10px] font-medium text-slate-400 -mt-1">
              Choose which disease detail pages should show this location under "Locations We Serve".
            </p>
            {diseases.length === 0 ? (
              <p className="text-[10px] font-bold text-slate-400 italic">
                No diseases configured yet — add some in Disease Management first.
              </p>
            ) : (
              <>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search diseases..."
                    value={diseaseSearch}
                    onChange={(e) => setDiseaseSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {diseases
                    .filter(d => d.name.toLowerCase().includes(diseaseSearch.toLowerCase()))
                    .map((disease) => {
                      const checked = selectedDiseaseIds.includes(disease.id);
                      return (
                        <label
                          key={disease.id}
                          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-colors ${
                            checked
                              ? 'bg-sky-50 border-sky-200 text-sky-800'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleDisease(disease.id)}
                            className="accent-sky-600 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-bold truncate">
                            {disease.icon} {disease.name}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </>
            )}
          </div>

          {/* Grid City, Phone, Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">City*</label>
              <input
                type="text"
                required
                placeholder="e.g. Lucknow"
                value={formState.city}
                onChange={(e) => setFormState(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Number*</label>
              <input
                type="text"
                required
                placeholder="e.g. +91-9871927192"
                value={formState.phone}
                onChange={(e) => setFormState(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address*</label>
              <input
                type="email"
                required
                placeholder="e.g. lucknow@karmaayurveda.com"
                value={formState.email}
                onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Full Address Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Address*</label>
            <textarea
              required
              placeholder="Enter the full street address or service-area description..."
              rows={3}
              value={formState.address}
              onChange={(e) => setFormState(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs transition-all resize-none bg-white font-semibold text-slate-800"
            ></textarea>
          </div>

          {/* Map URL Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Google Map URL</label>
            <input
              type="text"
              placeholder="https://maps.google.com/?q=..."
              value={formState.map_url}
              onChange={(e) => setFormState(prev => ({ ...prev, map_url: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
            />
          </div>

          {/* Image Upload Input & Preview */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Featured Photo*</label>
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
                    file:bg-sky-50 file:text-sky-700
                    hover:file:bg-sky-100
                    cursor-pointer"
                />
                <span className="text-[9px] font-bold text-slate-450 block">
                  Select a local JPG, PNG, or WEBP image. It will be securely stored in `/public/upload/locations`.
                </span>
              </div>

            </div>
          </div>

          {/* Submit Button Bar */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link
              href="/admin/locations-we-serve"
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
                'Save Location'
              )}
            </button>
          </div>

        </form>

      </div>

    </main>
  );
}
