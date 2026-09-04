'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Trash2, 
  Edit, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  UserCheck,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { 
  Doctor,
  createDoctorAction, 
  updateDoctorAction, 
  deleteDoctorAction 
} from '@/app/actions/doctorActions';
import { Clinic } from '@/lib/clinicData';

interface DoctorsManagerClientProps {
  initialDoctors: Doctor[];
  clinicsList: Clinic[];
}

export default function DoctorsManagerClient({ initialDoctors, clinicsList }: DoctorsManagerClientProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [educationInput, setEducationInput] = useState('');
  const [designationInput, setDesignationInput] = useState('');
  const [detailInput, setDetailInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [clinicIdInput, setClinicIdInput] = useState<string>('');
  const [isOwnerInput, setIsOwnerInput] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Stats
  const totalDoctors = doctors.length;
  const ownerDoctorsCount = doctors.filter(d => d.is_owner === 1).length;
  const staffDoctorsCount = doctors.filter(d => d.is_owner === 0).length;

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!nameInput.trim() || !educationInput.trim() || !designationInput.trim() || !detailInput.trim()) {
      setError('Name, education, designation, and bio details are required.');
      setSubmitting(false);
      return;
    }

    const clinicId = clinicIdInput ? parseInt(clinicIdInput) : null;
    const selectedClinic = clinicsList.find(c => c.id.toString() === clinicIdInput);

    const payload = {
      name: nameInput.trim(),
      education: educationInput.trim(),
      designation: designationInput.trim(),
      detail: detailInput.trim(),
      image: imageInput.trim() || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
      clinic_id: clinicId,
      is_owner: isOwnerInput ? 1 : 0
    };

    try {
      if (isEditing && editingId) {
        // Edit Action
        const result = await updateDoctorAction(editingId, payload);
        if (result.success) {
          setSuccess('Doctor profile updated successfully!');
          
          setDoctors(prev => 
            prev.map(d => 
              d.id === editingId 
                ? { 
                    ...d, 
                    ...payload, 
                    clinic_name: selectedClinic ? selectedClinic.name : undefined,
                    clinic_city: selectedClinic ? selectedClinic.city : undefined
                  } 
                : d
            )
          );
          handleCancelEdit();
        } else {
          setError(result.error || 'Failed to update doctor profile.');
        }
      } else {
        // Create Action
        const result = await createDoctorAction(payload);
        if (result.success) {
          setSuccess('Doctor profile created successfully!');
          
          const tempId = Date.now().toString();
          setDoctors(prev => [
            ...prev, 
            { 
              ...payload, 
              id: parseInt(tempId) || 0,
              clinic_name: selectedClinic ? selectedClinic.name : undefined,
              clinic_city: selectedClinic ? selectedClinic.city : undefined
            }
          ].sort((a, b) => b.is_owner - a.is_owner || a.name.localeCompare(b.name)));
          
          resetForm();
        } else {
          setError(result.error || 'Failed to create doctor profile.');
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
    setEducationInput('');
    setDesignationInput('');
    setDetailInput('');
    setImageInput('');
    setClinicIdInput('');
    setIsOwnerInput(false);
  };

  // Start Editing
  const handleStartEdit = (doc: Doctor) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(doc.id);

    setNameInput(doc.name);
    setEducationInput(doc.education);
    setDesignationInput(doc.designation);
    setDetailInput(doc.detail);
    setImageInput(doc.image);
    setClinicIdInput(doc.clinic_id ? doc.clinic_id.toString() : '');
    setIsOwnerInput(doc.is_owner === 1);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  // Delete doctor
  const handleDelete = async (doc: Doctor) => {
    if (!confirm(`Are you sure you want to delete the doctor profile for "${doc.name}"? This action is permanent.`)) return;

    setError(null);
    setSuccess(null);

    const originalDoctors = [...doctors];
    setDoctors(prev => prev.filter(d => d.id !== doc.id));

    const result = await deleteDoctorAction(doc.id);
    if (result.success) {
      setSuccess('Doctor profile deleted successfully.');
      startTransition(() => {});
    } else {
      setError(result.error || 'Failed to delete doctor profile.');
      setDoctors(originalDoctors);
    }
  };

  // Filter
  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.education.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Doctors</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-650/10">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Our Doctors</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage medical staff, credentials, and clinic associations</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex items-center justify-between">
          <div>
            <span className="text-[32px] font-black text-slate-900 leading-none">{totalDoctors}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2">Total Staff</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-450 flex items-center justify-center font-black">👨‍⚕️</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex items-center justify-between">
          <div>
            <span className="text-[32px] font-black text-[#d2621a] leading-none">{ownerDoctorsCount}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2">Owner Doctors</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-black">👑</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex items-center justify-between">
          <div>
            <span className="text-[32px] font-black text-emerald-600 leading-none">{staffDoctorsCount}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2">Specialist Physicians</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">🩺</div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Data Table (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 px-3">Doctors Directory ({filteredDoctors.length})</span>
            <div className="relative group w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, education..."
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
                    <th className="py-4 px-5">Doctor</th>
                    <th className="py-4 px-5">Credentials / Designation</th>
                    <th className="py-4 px-5">Clinic Associated</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No doctor records found.
                      </td>
                    </tr>
                  ) : (
                    filteredDoctors.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Column 1: Doctor Avatar & Name */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-slate-150 overflow-hidden flex-shrink-0 bg-slate-50 shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block leading-tight">{doc.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[200px] mt-0.5">
                                {doc.detail}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Credentials & Designation */}
                        <td className="py-4 px-5">
                          <span className="text-[#d2621a] font-extrabold block">{doc.education}</span>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">{doc.designation}</span>
                        </td>

                        {/* Column 3: Clinic Associated */}
                        <td className="py-4 px-5 text-slate-500">
                          {doc.clinic_name ? (
                            <div>
                              <span className="font-extrabold block text-slate-700">{doc.clinic_name}</span>
                              <span className="text-[10px] text-slate-400 font-semibold block">{doc.clinic_city}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic font-medium">Not Assigned</span>
                          )}
                        </td>

                        {/* Column 4: Status */}
                        <td className="py-4 px-5 text-center">
                          {doc.is_owner === 1 ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-amber-250">
                              <span className="w-1 h-1 rounded-full bg-amber-500"></span> Owner
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              Specialist
                            </span>
                          )}
                        </td>

                        {/* Column 5: Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(doc)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Doctor"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Doctor"
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
                {isEditing ? 'Edit Doctor Profile' : 'Add New Doctor'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                {isEditing ? 'Modify physician details and credentials' : 'Register a new doctor to the hospital roster'}
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
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Full Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Nikhil Diwakar Sharma"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Qualifications*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayurveda Doctor, BAMS"
                    value={educationInput}
                    onChange={(e) => setEducationInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Designation*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meditative Healer"
                    value={designationInput}
                    onChange={(e) => setDesignationInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Avatar Image URL</label>
                <input
                  type="text"
                  placeholder="Unsplash URL or file path"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Associated Clinic</label>
                <select
                  value={clinicIdInput}
                  onChange={(e) => setClinicIdInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 appearance-none"
                >
                  <option value="">-- No Associated Clinic --</option>
                  {clinicsList.map(clinic => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name} ({clinic.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Detailed Bio / Description*</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell about doctor experience, specialties, background..."
                  value={detailInput}
                  onChange={(e) => setDetailInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none"
                />
              </div>

              {/* Owner Toggle */}
              <div className="pt-2 flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div>
                  <span className="text-[10px] font-black text-slate-700 block">Is Hospital Owner?</span>
                  <span className="text-[9px] text-slate-400 font-bold">Featured position at the top (e.g. Dr. Puneet Dhawan)</span>
                </div>
                <input
                  type="checkbox"
                  checked={isOwnerInput}
                  onChange={(e) => setIsOwnerInput(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
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
                      {isEditing ? 'Update Doctor' : 'Register Doctor'}
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
