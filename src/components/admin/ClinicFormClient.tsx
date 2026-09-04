'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ArrowLeft, Loader2, AlertCircle, Image as ImageIcon, Video, Images, X, Stethoscope, Plus } from 'lucide-react';
import {
  createClinicAction,
  updateClinicAction,
  uploadClinicImageAction,
  addClinicGalleryImageAction,
  deleteClinicGalleryImageAction,
  setClinicDoctorsListAction,
  uploadClinicDoctorImageAction
} from '@/app/actions/clinicActions';
import { Clinic, ClinicTag, ClinicGalleryImage, ClinicDoctor } from '@/lib/clinicData';

interface ClinicFormClientProps {
  editingClinic?: Clinic;
  allTags?: ClinicTag[];
  initialDoctors?: ClinicDoctor[];
  initialGallery?: ClinicGalleryImage[];
}

interface DoctorEntry {
  name: string;
  designation: string;
  about: string;
  image: string;
  imageFile: File | null;
  imagePreview: string | null;
}

export default function ClinicFormClient({ editingClinic, allTags = [], initialDoctors = [], initialGallery = [] }: ClinicFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTags, setSelectedTags] = useState<number[]>(editingClinic?.tag_ids || []);
  const [doctors, setDoctors] = useState<DoctorEntry[]>(
    initialDoctors.map(d => ({
      name: d.name,
      designation: d.designation,
      about: d.about,
      image: d.image || '',
      imageFile: null,
      imagePreview: d.image || null
    }))
  );

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleAddDoctor = () => {
    setDoctors(prev => [...prev, { name: '', designation: '', about: '', image: '', imageFile: null, imagePreview: null }]);
  };

  const handleRemoveDoctor = (index: number) => {
    setDoctors(prev => prev.filter((_, i) => i !== index));
  };

  const handleDoctorChange = (index: number, field: 'name' | 'designation' | 'about', value: string) => {
    setDoctors(prev => prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc)));
  };

  const handleDoctorImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDoctors(prev => prev.map((doc, i) =>
      i === index ? { ...doc, imageFile: file, imagePreview: URL.createObjectURL(file) } : doc
    ));
  };

  // Gallery — only manageable once the clinic already exists (has a real id)
  const [gallery, setGallery] = useState<ClinicGalleryImage[]>(initialGallery);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editingClinic) return;

    setGalleryError(null);
    setGalleryUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);
    const result = await addClinicGalleryImageAction(editingClinic.id, uploadData);
    if (result.success && result.image) {
      setGallery(prev => [...prev, result.image!]);
    } else {
      setGalleryError(result.error || 'Failed to upload gallery photo.');
    }
    setGalleryUploading(false);
  };

  const handleGalleryDelete = async (imageId: number) => {
    const original = gallery;
    setGallery(prev => prev.filter(img => img.id !== imageId));
    const result = await deleteClinicGalleryImageAction(imageId);
    if (!result.success) {
      setGalleryError(result.error || 'Failed to delete gallery photo.');
      setGallery(original);
    }
  };

  const [formState, setFormState] = useState({
    name: editingClinic?.name || '',
    slug: editingClinic?.slug || '',
    city: editingClinic?.city || 'Delhi',
    phone: editingClinic?.phone || '+91-99719-28080',
    email: editingClinic?.email || 'info@karmaayurveda.com',
    address: editingClinic?.address || '',
    map_url: editingClinic?.map_url || '',
    image: editingClinic?.image || '',
    video_url: editingClinic?.video_url || ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editingClinic?.image || null);

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
      slug: editingClinic ? prev.slug : generatedSlug
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

    if (!editingClinic && !imageFile && !isTestMode) {
      setError('Featured clinic location photo is required.');
      setSubmitting(false);
      return;
    }

    let finalImageUrl = formState.image;

    // 1. Upload image if selected
    if (imageFile) {
      try {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        const uploadResult = await uploadClinicImageAction(uploadData);
        if (!uploadResult.success) {
          setError(uploadResult.error || 'Failed to upload clinic image.');
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
    } else if (isTestMode && !editingClinic) {
      finalImageUrl = '/upload/clinic/mock-clinic.png';
    }

    const clinicPayload = {
      ...formState,
      image: finalImageUrl
    };

    // 2. Upload any new doctor photos, then build the final payload
    let doctorsPayload;
    try {
      doctorsPayload = await Promise.all(
        doctors.map(async (doc) => {
          let image = doc.image;
          if (doc.imageFile) {
            const uploadData = new FormData();
            uploadData.append('image', doc.imageFile);
            const uploadResult = await uploadClinicDoctorImageAction(uploadData);
            if (uploadResult.success) {
              image = uploadResult.url || '';
            }
          }
          return { name: doc.name, designation: doc.designation, about: doc.about, image };
        })
      );
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred while uploading doctor photos.');
      setSubmitting(false);
      return;
    }

    try {
      if (editingClinic) {
        // Update Action
        const result = await updateClinicAction(editingClinic.id, clinicPayload, selectedTags);
        if (result.success) {
          await setClinicDoctorsListAction(editingClinic.id, doctorsPayload);
          startTransition(() => {
            router.push('/admin/clinics');
            router.refresh();
          });
        } else {
          setError(result.error || 'Failed to update clinic.');
          setSubmitting(false);
        }
      } else {
        // Create Action
        const result = await createClinicAction(clinicPayload, selectedTags);
        if (result.success) {
          if (result.id) {
            await setClinicDoctorsListAction(result.id, doctorsPayload);
          }
          startTransition(() => {
            router.push('/admin/clinics');
            router.refresh();
          });
        } else {
          setError(result.error || 'Failed to create clinic.');
          setSubmitting(false);
        }
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected server error occurred while saving the clinic.');
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <Link href="/admin/clinics" className="hover:text-slate-650">Our Clinics</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">{editingClinic ? 'Edit' : 'Add'}</span>
      </div>

      {/* Page Title & Cancel Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/10">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {editingClinic ? 'Edit Clinic Location' : 'Add New Clinic'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {editingClinic ? 'Update existing clinic details and contacts' : 'Register a new hospital clinic location'}
            </p>
          </div>
        </div>

        <Link
          href="/admin/clinics"
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
          
          {/* Clinic Name Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clinic Name*</label>
            <input
              type="text"
              required
              placeholder="e.g. Karma Ayurveda Delhi Clinic"
              value={formState.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
            />
          </div>

          {/* Slug Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">URL Slug (Auto-generated)*</label>
            <input
              type="text"
              required
              placeholder="e.g. delhi-clinic"
              value={formState.slug}
              onChange={(e) => setFormState(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all bg-white font-mono font-bold text-slate-800"
            />
          </div>

          {/* Tag Multi-Select Checkbox Grid */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Assign Tags</label>
            <div className="border border-slate-150 rounded-lg p-3 bg-slate-50/50 max-h-36 overflow-y-auto space-y-2">
              {allTags.length === 0 ? (
                <span className="text-[10px] text-slate-400 font-semibold italic">No tags created yet.</span>
              ) : (
                allTags.map(tag => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-colors select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => handleTagToggle(tag.id)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>{tag.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Our Doctors — dynamic name/designation/about list */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Stethoscope className="w-3 h-3" /> Our Doctors
            </label>

            <div className="space-y-3">
              {doctors.length === 0 && (
                <p className="text-[10px] font-bold text-slate-400 italic bg-slate-50/50 border border-slate-150 rounded-lg p-3">
                  No doctors added yet. Click "Add Doctor" to list a doctor for this clinic.
                </p>
              )}

              {doctors.map((doc, index) => (
                <div key={index} className="relative border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveDoctor(index)}
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove doctor"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pr-6">
                    <div className="w-14 h-14 rounded-full border border-slate-200 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                      {doc.imagePreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={doc.imagePreview} alt={doc.name || 'Doctor'} className="w-full h-full object-cover" />
                      ) : (
                        <Stethoscope className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleDoctorImageChange(index, e)}
                      className="block w-full text-xs text-slate-500
                        file:mr-4 file:py-1.5 file:px-4
                        file:rounded-xl file:border-0
                        file:text-[11px] file:font-black
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100
                        cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Doctor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Puneet Dhawan"
                        value={doc.name}
                        onChange={(e) => handleDoctorChange(index, 'name', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Chief Ayurveda Physician"
                        value={doc.designation}
                        onChange={(e) => handleDoctorChange(index, 'designation', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">About</label>
                    <textarea
                      placeholder="Short bio about the doctor..."
                      rows={2}
                      value={doc.about}
                      onChange={(e) => handleDoctorChange(index, 'about', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all resize-none bg-white font-semibold text-slate-800"
                    ></textarea>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddDoctor}
                className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Doctor
              </button>
            </div>
          </div>

          {/* Grid City, Phone, Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">City*</label>
              <input
                type="text"
                required
                placeholder="e.g. Delhi"
                value={formState.city}
                onChange={(e) => setFormState(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address*</label>
              <input
                type="email"
                required
                placeholder="e.g. delhi@karmaayurveda.com"
                value={formState.email}
                onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Full Address Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Address*</label>
            <textarea
              required
              placeholder="Enter the full street address..."
              rows={3}
              value={formState.address}
              onChange={(e) => setFormState(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all resize-none bg-white font-semibold text-slate-800"
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
            />
          </div>

          {/* Video URL Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Video className="w-3 h-3" /> Clinic Video URL
            </label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formState.video_url}
              onChange={(e) => setFormState(prev => ({ ...prev, video_url: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs transition-all bg-white font-semibold text-slate-800"
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
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    cursor-pointer"
                />
                <span className="text-[9px] font-bold text-slate-450 block">
                  Select a local JPG, PNG, or WEBP image. It will be securely stored in `/public/upload/clinic`.
                </span>
              </div>

            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Images className="w-3 h-3" /> Gallery Images
            </label>

            {!editingClinic ? (
              <p className="text-[10px] font-bold text-slate-400 italic bg-slate-50/50 border border-slate-150 rounded-lg p-3">
                Save the clinic first — then you can come back here to add gallery photos.
              </p>
            ) : (
              <div className="space-y-3">
                {galleryError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-[10px] font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    {galleryError}
                  </div>
                )}

                {gallery.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {gallery.map(img => (
                      <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.image} alt="Gallery" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleGalleryDelete(img.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryFileSelect}
                  disabled={galleryUploading}
                  className="block w-full text-xs text-slate-500
                    file:mr-4 file:py-1.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-[11px] file:font-black
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    cursor-pointer disabled:opacity-50"
                />
                {galleryUploading && (
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading photo...
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Submit Button Bar */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link
              href="/admin/clinics"
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
                'Save Clinic'
              )}
            </button>
          </div>

        </form>

      </div>

    </main>
  );
}
