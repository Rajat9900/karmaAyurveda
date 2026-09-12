'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Loader2, AlertCircle, Image as ImageIcon, X, Plus, Layers } from 'lucide-react';
import {
  createWebStoryAction,
  updateWebStoryAction,
  setWebStoryPanelsAction,
  uploadWebStoryImageAction,
  WebStory
} from '@/app/actions/webStoryActions';

interface WebStoryFormClientProps {
  editingStory?: WebStory;
}

interface PanelEntry {
  heading: string;
  paragraph: string;
  image: string;
  imageFile: File | null;
  imagePreview: string | null;
}

const slugify = (text: string) =>
  text.toLowerCase().replace(/\//g, '-').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

export default function WebStoryFormClient({ editingStory }: WebStoryFormClientProps) {
  const router = useRouter();

  const [formState, setFormState] = useState({
    slug: editingStory?.slug || '',
    meta_title: editingStory?.meta_title || '',
    meta_des: editingStory?.meta_des || '',
    meta_keywords: editingStory?.meta_keywords || ''
  });

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(editingStory?.cover_image || null);

  const [panels, setPanels] = useState<PanelEntry[]>(
    editingStory?.panels && editingStory.panels.length > 0
      ? editingStory.panels.map(p => ({
          heading: p.heading,
          paragraph: p.paragraph,
          image: p.image,
          imageFile: null,
          imagePreview: p.image || null
        }))
      : [{ heading: '', paragraph: '', image: '', imageFile: null, imagePreview: null }]
  );

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSlugSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, slug: e.target.value }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddPanel = () => {
    setPanels(prev => [...prev, { heading: '', paragraph: '', image: '', imageFile: null, imagePreview: null }]);
  };

  const handleRemovePanel = (index: number) => {
    setPanels(prev => prev.filter((_, i) => i !== index));
  };

  const handlePanelChange = (index: number, field: 'heading' | 'paragraph', value: string) => {
    setPanels(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handlePanelImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPanels(prev => prev.map((p, i) =>
      i === index ? { ...p, imageFile: file, imagePreview: URL.createObjectURL(file) } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formState.slug.trim()) {
      setError('Slug (URL) is a required field.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload cover image if a new one was selected
      let coverImageUrl = editingStory?.cover_image || '';
      if (coverImageFile) {
        const uploadData = new FormData();
        uploadData.append('image', coverImageFile);
        const uploadResult = await uploadWebStoryImageAction(uploadData);
        if (!uploadResult.success) {
          setError(uploadResult.error || 'Failed to upload cover image.');
          setSubmitting(false);
          return;
        }
        coverImageUrl = uploadResult.url || '';
      }

      // 2. Upload any new panel images, then build the final panels payload
      const panelsPayload = await Promise.all(
        panels.map(async (panel) => {
          let image = panel.image;
          if (panel.imageFile) {
            const uploadData = new FormData();
            uploadData.append('image', panel.imageFile);
            const uploadResult = await uploadWebStoryImageAction(uploadData);
            if (uploadResult.success) {
              image = uploadResult.url || '';
            }
          }
          return { heading: panel.heading, paragraph: panel.paragraph, image };
        })
      );

      const storyPayload = {
        slug: slugify(formState.slug),
        meta_title: formState.meta_title,
        meta_des: formState.meta_des,
        meta_keywords: formState.meta_keywords,
        cover_image: coverImageUrl
      };

      if (editingStory) {
        const result = await updateWebStoryAction(editingStory.id, storyPayload);
        if (!result.success) {
          setError(result.error || 'Failed to update web story.');
          setSubmitting(false);
          return;
        }
        await setWebStoryPanelsAction(editingStory.id, panelsPayload);
      } else {
        const result = await createWebStoryAction(storyPayload);
        if (!result.success) {
          setError(result.error || 'Failed to create web story.');
          setSubmitting(false);
          return;
        }
        if (result.id) {
          await setWebStoryPanelsAction(result.id, panelsPayload);
        }
      }

      router.push('/admin/admin_view_stories');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('An unexpected server error occurred while saving the story.');
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">

      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <Link href="/admin/admin_view_stories" className="hover:text-slate-650">Web Stories</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">{editingStory ? 'Edit' : 'Add'}</span>
      </div>

      {/* Page Title & View Stories Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {editingStory ? 'Edit Web Story' : 'Add Web Story'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {editingStory ? 'Update this story\'s panels and metadata' : 'Create a new mobile-first visual story'}
            </p>
          </div>
        </div>

        <Link
          href="/admin/admin_view_stories"
          className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          View Stories
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

          {/* Slug */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Slug (URL)*</label>
            <input
              type="text"
              required
              placeholder="e.g. kidney-detox-morning-routine"
              value={formState.slug}
              onChange={handleSlugSourceChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-600 focus:border-teal-600 outline-none text-xs transition-all bg-white font-mono font-bold text-slate-800"
            />
          </div>

          {/* Meta Title */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meta Title</label>
            <input
              type="text"
              placeholder="e.g. 5 Morning Habits for Healthy Kidneys"
              value={formState.meta_title}
              onChange={(e) => setFormState(prev => ({ ...prev, meta_title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-600 focus:border-teal-600 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meta Description</label>
            <textarea
              rows={3}
              placeholder="A short description shown in search results and social previews..."
              value={formState.meta_des}
              onChange={(e) => setFormState(prev => ({ ...prev, meta_des: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-600 focus:border-teal-600 outline-none text-xs transition-all resize-none bg-white font-semibold text-slate-800"
            ></textarea>
          </div>

          {/* Meta Keywords */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meta Keywords (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. kidney health, ayurveda, detox, morning routine"
              value={formState.meta_keywords}
              onChange={(e) => setFormState(prev => ({ ...prev, meta_keywords: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-600 focus:border-teal-600 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Cover Image</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                {coverImagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="space-y-1 flex-grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="block w-full text-xs text-slate-500
                    file:mr-4 file:py-1.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-[11px] file:font-black
                    file:bg-teal-50 file:text-teal-700
                    hover:file:bg-teal-100
                    cursor-pointer"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Panels — dynamic "Add New Panel" list */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Layers className="w-3.5 h-3.5" />
              Story Panels
            </div>

            {panels.map((panel, index) => (
              <div key={index} className="relative border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-650">Panel {index + 1}</span>
                  {panels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePanel(index)}
                      className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove panel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Panel Image */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Image {index + 1}</label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg border border-slate-200 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                      {panel.imagePreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={panel.imagePreview} alt={`Panel ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePanelImageChange(index, e)}
                      className="block w-full text-xs text-slate-500
                        file:mr-4 file:py-1.5 file:px-4
                        file:rounded-xl file:border-0
                        file:text-[11px] file:font-black
                        file:bg-teal-50 file:text-teal-700
                        hover:file:bg-teal-100
                        cursor-pointer"
                    />
                  </div>
                </div>

                {/* Panel Heading */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Heading (H2) {index + 1}</label>
                  <input
                    type="text"
                    placeholder="e.g. Start Your Day with Warm Water"
                    value={panel.heading}
                    onChange={(e) => handlePanelChange(index, 'heading', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-600 focus:border-teal-600 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
                  />
                </div>

                {/* Panel Paragraph */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paragraph {index + 1}</label>
                  <textarea
                    rows={3}
                    placeholder="Panel body text..."
                    value={panel.paragraph}
                    onChange={(e) => handlePanelChange(index, 'paragraph', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-600 focus:border-teal-600 outline-none text-xs transition-all resize-none bg-white font-semibold text-slate-800"
                  ></textarea>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddPanel}
              className="text-[11px] font-black text-teal-700 hover:text-teal-900 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Panel
            </button>
          </div>

          {/* Submit Button Bar */}
          <div className="pt-4 border-t border-slate-100 flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Story'
              )}
            </button>
          </div>

        </form>
      </div>

    </main>
  );
}
