'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Minus,
  Leaf,
  Activity,
  Sun,
  Heart,
  Droplet,
  Flame,
  Moon,
  Zap,
  Shield,
  Wind,
  Layers
} from 'lucide-react';
import {
  Pillar,
  createPillarAction,
  updatePillarAction,
  deletePillarAction,
  setPillarDiseaseLinksAction
} from '@/app/actions/pillarActions';
import { Disease } from '@/app/actions/diseaseActions';

interface PillarsManagerClientProps {
  initialPillars: Pillar[];
  diseases: Disease[];
  pillarDiseaseLinks: Record<number, number[]>;
}

interface TherapyForm {
  id: string;
  name: string;
  what: string;
  how: string;
  why: string;
  benefits: string;
  image: string;
  videoId: string;
}

interface CategoryForm {
  title: string;
  subtitle: string;
  therapies: TherapyForm[];
}

// Curated icon set for pillar badges (must all exist in lucide-react)
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Leaf, Activity, Sun, Heart, Droplet, Flame, Moon, Zap, Shield, Wind
};
const ICON_NAMES = Object.keys(ICON_MAP);

const emptyTherapy = (): TherapyForm => ({
  id: '', name: '', what: '', how: '', why: '', benefits: '', image: '', videoId: ''
});

const emptyCategory = (): CategoryForm => ({
  title: '', subtitle: '', therapies: [emptyTherapy()]
});

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

export default function PillarsManagerClient({ initialPillars, diseases, pillarDiseaseLinks }: PillarsManagerClientProps) {
  const [pillars, setPillars] = useState<Pillar[]>(initialPillars);
  const [diseaseLinks, setDiseaseLinks] = useState<Record<number, number[]>>(pillarDiseaseLinks);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [pillarKeyInput, setPillarKeyInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [subtitleInput, setSubtitleInput] = useState('');
  const [badgeInput, setBadgeInput] = useState('');
  const [iconInput, setIconInput] = useState('Sparkles');
  const [imageInput, setImageInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [categories, setCategories] = useState<CategoryForm[]>([emptyCategory()]);
  // New pillars show on every disease by default; admins opt individual diseases out.
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState<number[]>(diseases.map(d => d.id));
  const [diseaseSearch, setDiseaseSearch] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Auto-generate key/number from name when creating
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNameInput(name);
    if (!isEditing) {
      setPillarKeyInput(slugify(name));
    }
  };

  // Linked Diseases Handler
  const handleToggleDisease = (diseaseId: number) => {
    setSelectedDiseaseIds(prev =>
      prev.includes(diseaseId) ? prev.filter(id => id !== diseaseId) : [...prev, diseaseId]
    );
  };

  // Category handlers
  const handleAddCategory = () => {
    setCategories(prev => [...prev, emptyCategory()]);
  };

  const handleRemoveCategory = (catIdx: number) => {
    setCategories(prev => prev.filter((_, i) => i !== catIdx));
  };

  const handleCategoryChange = (catIdx: number, field: 'title' | 'subtitle', value: string) => {
    setCategories(prev =>
      prev.map((cat, i) => i === catIdx ? { ...cat, [field]: value } : cat)
    );
  };

  // Therapy handlers (nested within a category)
  const handleAddTherapy = (catIdx: number) => {
    setCategories(prev =>
      prev.map((cat, i) => i === catIdx ? { ...cat, therapies: [...cat.therapies, emptyTherapy()] } : cat)
    );
  };

  const handleRemoveTherapy = (catIdx: number, thIdx: number) => {
    setCategories(prev =>
      prev.map((cat, i) => i === catIdx ? { ...cat, therapies: cat.therapies.filter((_, j) => j !== thIdx) } : cat)
    );
  };

  const handleTherapyNameChange = (catIdx: number, thIdx: number, value: string) => {
    setCategories(prev =>
      prev.map((cat, i) => {
        if (i !== catIdx) return cat;
        return {
          ...cat,
          therapies: cat.therapies.map((th, j) => {
            if (j !== thIdx) return th;
            const autoId = !th.id || th.id === slugify(th.name) ? slugify(value) : th.id;
            return { ...th, name: value, id: autoId };
          })
        };
      })
    );
  };

  const handleTherapyChange = (catIdx: number, thIdx: number, field: keyof TherapyForm, value: string) => {
    setCategories(prev =>
      prev.map((cat, i) => {
        if (i !== catIdx) return cat;
        return {
          ...cat,
          therapies: cat.therapies.map((th, j) => j === thIdx ? { ...th, [field]: value } : th)
        };
      })
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!nameInput.trim() || !pillarKeyInput.trim() || !numberInput.trim() || !descInput.trim()) {
      setError('Key, number, name, and description are required fields.');
      setSubmitting(false);
      return;
    }

    // Clean categories: drop empty categories/therapies before saving
    const cleanedCategories = categories
      .filter(cat => cat.title.trim() !== '')
      .map(cat => ({
        title: cat.title.trim(),
        subtitle: cat.subtitle.trim(),
        therapies: cat.therapies
          .filter(th => th.name.trim() !== '')
          .map(th => ({
            id: th.id.trim() || slugify(th.name),
            name: th.name.trim(),
            what: th.what.trim(),
            how: th.how.trim(),
            why: th.why.trim(),
            benefits: th.benefits.trim(),
            image: th.image.trim(),
            ...(th.videoId.trim() ? { videoId: th.videoId.trim() } : {})
          }))
      }));

    const payload = {
      pillar_key: pillarKeyInput.trim().toLowerCase(),
      number: numberInput.trim(),
      name: nameInput.trim(),
      subtitle: subtitleInput.trim(),
      badge: badgeInput.trim(),
      icon: iconInput,
      image: imageInput.trim(),
      description: descInput.trim(),
      categories: JSON.stringify(cleanedCategories),
      sort_order: parseInt(numberInput.trim(), 10) || 0
    };

    try {
      if (isEditing && editingId) {
        const result = await updatePillarAction(editingId, payload);
        if (result.success) {
          await setPillarDiseaseLinksAction(editingId, selectedDiseaseIds);
          setDiseaseLinks(prev => ({ ...prev, [Number(editingId)]: selectedDiseaseIds }));
          setSuccess('Pillar updated successfully!');
          setPillars(prev =>
            prev.map(p => p.id === editingId ? { ...p, ...payload, id: Number(editingId) } : p)
              .sort((a, b) => a.sort_order - b.sort_order)
          );
          handleCancelEdit();
        } else {
          setError(result.error || 'Failed to update pillar.');
        }
      } else {
        const result = await createPillarAction(payload);
        if (result.success) {
          const newId = result.id ?? Date.now();
          if (result.id) {
            await setPillarDiseaseLinksAction(result.id, selectedDiseaseIds);
          }
          setDiseaseLinks(prev => ({ ...prev, [newId]: selectedDiseaseIds }));
          setSuccess('Pillar created successfully!');
          setPillars(prev =>
            [...prev, { ...payload, id: newId }].sort((a, b) => a.sort_order - b.sort_order)
          );
          resetForm();
        } else {
          setError(result.error || 'Failed to create pillar.');
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
    setPillarKeyInput('');
    setNumberInput('');
    setNameInput('');
    setSubtitleInput('');
    setBadgeInput('');
    setIconInput('Sparkles');
    setImageInput('');
    setDescInput('');
    setCategories([emptyCategory()]);
    setSelectedDiseaseIds(diseases.map(d => d.id));
    setDiseaseSearch('');
  };

  const handleStartEdit = (pillar: Pillar) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(pillar.id);
    setSelectedDiseaseIds(diseaseLinks[pillar.id] ?? diseases.map(d => d.id));
    setDiseaseSearch('');

    setPillarKeyInput(pillar.pillar_key);
    setNumberInput(pillar.number);
    setNameInput(pillar.name);
    setSubtitleInput(pillar.subtitle);
    setBadgeInput(pillar.badge);
    setIconInput(ICON_NAMES.includes(pillar.icon) ? pillar.icon : 'Sparkles');
    setImageInput(pillar.image);
    setDescInput(pillar.description);

    try {
      const catArr = JSON.parse(pillar.categories) as CategoryForm[];
      setCategories(
        catArr.length > 0
          ? catArr.map(cat => ({
              title: cat.title || '',
              subtitle: cat.subtitle || '',
              therapies: cat.therapies.length > 0
                ? cat.therapies.map(th => ({
                    id: th.id || '',
                    name: th.name || '',
                    what: th.what || '',
                    how: th.how || '',
                    why: th.why || '',
                    benefits: th.benefits || '',
                    image: th.image || '',
                    videoId: (th as any).videoId || ''
                  }))
                : [emptyTherapy()]
            }))
          : [emptyCategory()]
      );
    } catch {
      setCategories([emptyCategory()]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = async (pillar: Pillar) => {
    if (!confirm(`Are you sure you want to delete the "${pillar.name}" pillar? This will remove it from every disease detail page.`)) return;

    setError(null);
    setSuccess(null);

    const originalPillars = [...pillars];
    setPillars(prev => prev.filter(p => p.id !== pillar.id));

    const result = await deletePillarAction(pillar.id);
    if (result.success) {
      setSuccess('Pillar deleted successfully.');
      startTransition(() => {});
    } else {
      setError(result.error || 'Failed to delete pillar.');
      setPillars(originalPillars);
    }
  };

  const filteredPillars = pillars.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.pillar_key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const countTherapies = (categoriesJson: string) => {
    try {
      const arr = JSON.parse(categoriesJson) as CategoryForm[];
      return arr.reduce((sum, cat) => sum + (cat.therapies?.length || 0), 0);
    } catch {
      return 0;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">

      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Pillars Management</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-650/10">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Pillars Management</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage the "How We Reverse Diseases" pillars, categories, and therapies</p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column: List Directory (2/3 width on large screens) */}
        <div className="xl:col-span-2 space-y-4">

          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 px-3">Pillar Directory ({filteredPillars.length})</span>
            <div className="relative group w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search pillars..."
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
                    <th className="py-4 px-5">Pillar</th>
                    <th className="py-4 px-5">Key</th>
                    <th className="py-4 px-5 text-center">Categories</th>
                    <th className="py-4 px-5 text-center">Therapies</th>
                    <th className="py-4 px-5 text-center">Diseases</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {filteredPillars.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-405">
                        <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No pillars found.
                      </td>
                    </tr>
                  ) : (
                    filteredPillars.map((pillar) => {
                      let catCount = 0;
                      try {
                        catCount = JSON.parse(pillar.categories || '[]').length;
                      } catch {}
                      const linkedDiseaseCount = (diseaseLinks[pillar.id] ?? []).length;
                      const Icon = ICON_MAP[pillar.icon] || Sparkles;
                      return (
                        <tr key={pillar.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 block">
                                  Pillar {pillar.number} · {pillar.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[240px]">
                                  {pillar.subtitle}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-mono text-slate-400 text-[11px]">{pillar.pillar_key}</span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                              {catCount}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                              {countTherapies(pillar.categories)}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                              {linkedDiseaseCount}/{diseases.length}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleStartEdit(pillar)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Pillar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(pillar)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Pillar"
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
                {isEditing ? 'Edit Pillar' : 'Add New Pillar'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                {isEditing ? 'Update pillar info, categories, and therapies' : 'Define a new treatment pillar'}
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
                    placeholder="e.g. Shodhan"
                    value={nameInput}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Pillar Key*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. shodhan"
                    value={pillarKeyInput}
                    onChange={(e) => setPillarKeyInput(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Number*</label>
                  <input
                    type="text"
                    required
                    placeholder="01"
                    value={numberInput}
                    onChange={(e) => setNumberInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-center text-xs bg-white font-bold text-slate-800"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Badge Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Therapies"
                    value={badgeInput}
                    onChange={(e) => setBadgeInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Cleansing & Detoxification"
                  value={subtitleInput}
                  onChange={(e) => setSubtitleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Icon</label>
                  <select
                    value={iconInput}
                    onChange={(e) => setIconInput(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  >
                    {ICON_NAMES.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tab/Header Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Description*</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Summarize what this pillar covers..."
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Linked Diseases */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Activity className="w-3.5 h-3.5" />
                  Linked Diseases
                </div>
                <p className="text-[10px] font-medium text-slate-400 -mt-1">
                  Choose which disease detail pages should show this pillar in "How We Reverse Diseases".
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
                        className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                      {diseases
                        .filter(d => d.name.toLowerCase().includes(diseaseSearch.toLowerCase()))
                        .map((disease) => {
                          const checked = selectedDiseaseIds.includes(disease.id);
                          return (
                            <label
                              key={disease.id}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-colors ${
                                checked
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleDisease(disease.id)}
                                className="accent-emerald-600 w-3.5 h-3.5"
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

              <hr className="border-slate-100" />

              {/* Dynamic Categories Editor */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categories & Therapies</span>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 px-2 py-1 rounded cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Category
                </button>
              </div>

              <div className="space-y-4">
                {categories.map((cat, catIdx) => (
                  <div key={catIdx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400">Category #{catIdx + 1}</span>
                      {categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(catIdx)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Category title (e.g. Panchakarma)"
                      value={cat.title}
                      onChange={(e) => handleCategoryChange(catIdx, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-bold text-slate-700"
                    />
                    <textarea
                      rows={2}
                      placeholder="Category subtitle..."
                      value={cat.subtitle}
                      onChange={(e) => handleCategoryChange(catIdx, 'subtitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-medium text-slate-600 resize-none"
                    />

                    {/* Nested Therapies */}
                    <div className="pl-3 border-l-2 border-emerald-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Therapies</span>
                        <button
                          type="button"
                          onClick={() => handleAddTherapy(catIdx)}
                          className="inline-flex items-center gap-1 text-[9px] font-black text-[#d2621a] hover:text-[#c2520a] bg-orange-50 hover:bg-orange-100/70 px-2 py-1 rounded cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Therapy
                        </button>
                      </div>

                      {cat.therapies.map((th, thIdx) => (
                        <div key={thIdx} className="p-2.5 border border-slate-100 rounded-lg bg-white relative space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400">Therapy #{thIdx + 1}</span>
                            {cat.therapies.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTherapy(catIdx, thIdx)}
                                className="text-slate-400 hover:text-red-500 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Therapy Name"
                              value={th.name}
                              onChange={(e) => handleTherapyNameChange(catIdx, thIdx, e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-700"
                            />
                            <input
                              type="text"
                              placeholder="id-slug"
                              value={th.id}
                              onChange={(e) => handleTherapyChange(catIdx, thIdx, 'id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono text-slate-600"
                            />
                          </div>
                          <textarea
                            rows={2}
                            placeholder="What Is This Therapy"
                            value={th.what}
                            onChange={(e) => handleTherapyChange(catIdx, thIdx, 'what', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 resize-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="How It Works"
                            value={th.how}
                            onChange={(e) => handleTherapyChange(catIdx, thIdx, 'how', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 resize-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Why This Therapy"
                            value={th.why}
                            onChange={(e) => handleTherapyChange(catIdx, thIdx, 'why', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 resize-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Benefits (comma separated)"
                            value={th.benefits}
                            onChange={(e) => handleTherapyChange(catIdx, thIdx, 'benefits', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 resize-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Image URL"
                              value={th.image}
                              onChange={(e) => handleTherapyChange(catIdx, thIdx, 'image', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
                            />
                            <input
                              type="text"
                              placeholder="YouTube Video ID (optional)"
                              value={th.videoId}
                              onChange={(e) => handleTherapyChange(catIdx, thIdx, 'videoId', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono text-slate-700"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
                      {isEditing ? 'Update Pillar' : 'Create Pillar'}
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
