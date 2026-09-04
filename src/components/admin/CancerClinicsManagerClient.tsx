'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Search, 
  Trash2, 
  Edit, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  Link2,
  Tag
} from 'lucide-react';
import { 
  CancerClinic,
  CancerTag,
  createCancerClinicAction, 
  updateCancerClinicAction, 
  deleteCancerClinicAction 
} from '@/app/actions/cancerActions';
import { Disease } from '@/app/actions/diseaseActions';

interface CancerClinicsManagerClientProps {
  initialClinics: CancerClinic[];
  diseasesList: Disease[];
  tagsList: CancerTag[];
}

export default function CancerClinicsManagerClient({ initialClinics, diseasesList, tagsList }: CancerClinicsManagerClientProps) {
  const [clinics, setClinics] = useState<CancerClinic[]>(initialClinics);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [mapUrlInput, setMapUrlInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [diseaseIdInput, setDiseaseIdInput] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

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
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!nameInput.trim() || !slugInput.trim() || !addressInput.trim() || !cityInput.trim() || !phoneInput.trim() || !emailInput.trim()) {
      setError('Name, Slug, Address, City, Phone, and Email are required.');
      setSubmitting(false);
      return;
    }

    const diseaseId = diseaseIdInput ? parseInt(diseaseIdInput) : null;
    const selectedDisease = diseasesList.find(d => d.id.toString() === diseaseIdInput);

    const payload = {
      name: nameInput.trim(),
      slug: slugInput.trim(),
      address: addressInput.trim(),
      city: cityInput.trim(),
      phone: phoneInput.trim(),
      email: emailInput.trim(),
      map_url: mapUrlInput.trim(),
      image: imageInput.trim() || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      disease_id: diseaseId
    };

    try {
      const mappedTagNames = selectedTags.map(id => tagsList.find(t => t.id === id)?.name || '').filter(Boolean);

      if (isEditing && editingId) {
        // Edit Action
        const result = await updateCancerClinicAction(editingId, payload, selectedTags);
        if (result.success) {
          setSuccess('Cancer clinic updated successfully!');
          
          setClinics(prev => 
            prev.map(c => 
              c.id === editingId 
                ? { 
                    ...c, 
                    ...payload, 
                    disease_name: selectedDisease ? selectedDisease.name : undefined,
                    tag_ids: selectedTags,
                    tag_names: mappedTagNames
                  } 
                : c
            )
          );
          handleCancelEdit();
        } else {
          setError(result.error || 'Failed to update clinic.');
        }
      } else {
        // Create Action
        const result = await createCancerClinicAction(payload, selectedTags);
        if (result.success) {
          setSuccess('Cancer clinic created successfully!');
          
          const tempId = Date.now().toString();
          setClinics(prev => [
            ...prev, 
            { 
              ...payload, 
              id: parseInt(tempId) || 0,
              disease_name: selectedDisease ? selectedDisease.name : undefined,
              tag_ids: selectedTags,
              tag_names: mappedTagNames
            }
          ].sort((a, b) => a.name.localeCompare(b.name)));
          
          resetForm();
        } else {
          setError(result.error || 'Failed to create clinic.');
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
    setAddressInput('');
    setCityInput('');
    setPhoneInput('');
    setEmailInput('');
    setMapUrlInput('');
    setImageInput('');
    setDiseaseIdInput('');
    setSelectedTags([]);
  };

  // Start Editing
  const handleStartEdit = (clinic: CancerClinic) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(clinic.id);

    setNameInput(clinic.name);
    setSlugInput(clinic.slug);
    setAddressInput(clinic.address);
    setCityInput(clinic.city);
    setPhoneInput(clinic.phone);
    setEmailInput(clinic.email);
    setMapUrlInput(clinic.map_url || '');
    setImageInput(clinic.image || '');
    setDiseaseIdInput(clinic.disease_id ? clinic.disease_id.toString() : '');
    setSelectedTags(clinic.tag_ids || []);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  // Delete clinic
  const handleDelete = async (clinic: CancerClinic) => {
    if (!confirm(`Are you sure you want to delete "${clinic.name}"?`)) return;

    setError(null);
    setSuccess(null);

    const originalClinics = [...clinics];
    setClinics(prev => prev.filter(c => c.id !== clinic.id));

    const result = await deleteCancerClinicAction(clinic.id);
    if (result.success) {
      setSuccess('Cancer clinic deleted successfully.');
      startTransition(() => {});
    } else {
      setError(result.error || 'Failed to delete clinic.');
      setClinics(originalClinics);
    }
  };

  // Filter
  const filteredClinics = clinics.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Cancer Clinics</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-650/10">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Cancer Clinics</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage specialized Cancer treatment centers, linked conditions, and filters</p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Data Table (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 px-3">Clinics List ({filteredClinics.length})</span>
            <div className="relative group w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search clinics..."
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
                    <th className="py-4 px-5">Clinic</th>
                    <th className="py-4 px-5">Contact Details</th>
                    <th className="py-4 px-5">Target Disease & Tags</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {filteredClinics.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No Cancer clinics found.
                      </td>
                    </tr>
                  ) : (
                    filteredClinics.map((clinic) => (
                      <tr key={clinic.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Column 1: Clinic Name & Address */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded-lg overflow-hidden border border-slate-150 flex-shrink-0 bg-slate-50 shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={clinic.image || ''} alt={clinic.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block leading-tight">{clinic.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[200px] mt-0.5">
                                {clinic.address}, {clinic.city}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Contact Details */}
                        <td className="py-4 px-5">
                          <span className="text-slate-800 font-bold block">{clinic.phone}</span>
                          <span className="text-[10px] text-slate-405 mt-0.5 block">{clinic.email}</span>
                        </td>

                        {/* Column 3: Linked Disease & Tags */}
                        <td className="py-4 px-5">
                          <div className="space-y-1.5 max-w-[220px]">
                            {/* Disease Badge */}
                            <div>
                              {clinic.disease_name ? (
                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-green-150">
                                  <Link2 className="w-3 h-3 text-green-550" /> {clinic.disease_name}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic font-medium text-[10px]">No linked condition</span>
                              )}
                            </div>

                            {/* Tags badges list */}
                            <div className="flex flex-wrap gap-1">
                              {clinic.tag_names && clinic.tag_names.length > 0 ? (
                                clinic.tag_names.map((tagName, index) => (
                                  <span 
                                    key={index}
                                    className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-extrabold border border-blue-150"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-blue-450" /> {tagName}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-350 font-semibold text-[9px] italic">No tags selected</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Column 4: Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(clinic)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Clinic"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(clinic)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Clinic"
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
                {isEditing ? 'Edit Clinic' : 'Add New Clinic'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                {isEditing ? 'Modify Cancer clinic coordinates' : 'Register a new center linked to medical conditions'}
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
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi Center"
                    value={nameInput}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Slug*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. delhi-center"
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">City*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Target Disease</label>
                  <select
                    value={diseaseIdInput}
                    onChange={(e) => setDiseaseIdInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 appearance-none"
                  >
                    <option value="">-- No Linked Disease --</option>
                    {diseasesList.map(disease => (
                      <option key={disease.id} value={disease.id}>
                        {disease.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tag Multi-Select Checkbox Grid */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Assign Tags</label>
                <div className="border border-slate-150 rounded-lg p-3 bg-slate-50/50 max-h-36 overflow-y-auto space-y-2">
                  {tagsList.length === 0 ? (
                    <span className="text-[10px] text-slate-400 font-semibold italic">No tags created yet.</span>
                  ) : (
                    tagsList.map(tag => (
                      <label 
                        key={tag.id}
                        className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors select-none"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => handleTagToggle(tag.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>{tag.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Phone Number*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 99999 77777"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email Address*</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. delhi@karma.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Address Road / Pocket*</label>
                <input
                  type="text"
                  required
                  placeholder="Street address detail..."
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Featured Image URL</label>
                <input
                  type="text"
                  placeholder="Unsplash URL"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Google Map URL</label>
                <textarea
                  rows={2}
                  placeholder="Embed link or coordinates..."
                  value={mapUrlInput}
                  onChange={(e) => setMapUrlInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none"
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
                      {isEditing ? 'Update Center' : 'Create Center'}
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
