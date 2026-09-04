'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  Trash2, 
  Edit, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { 
  SiteFaqItem,
  createSiteFaqAction, 
  updateSiteFaqAction, 
  deleteSiteFaqAction 
} from '@/app/actions/siteFaqActions';

interface SiteFaqsManagerClientProps {
  initialFaqs: SiteFaqItem[];
}

export default function SiteFaqsManagerClient({ initialFaqs }: SiteFaqsManagerClientProps) {
  const [faqs, setFaqs] = useState<SiteFaqItem[]>(initialFaqs);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [sortingInput, setSortingInput] = useState<string>('0');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!questionInput.trim() || !answerInput.trim()) {
      setError('Question and Answer are required fields.');
      setSubmitting(false);
      return;
    }

    const payload = {
      question: questionInput.trim(),
      answer: answerInput.trim(),
      sorting: parseInt(sortingInput) || 0
    };

    try {
      if (isEditing && editingId) {
        // Edit Action
        const result = await updateSiteFaqAction(editingId, payload);
        if (result.success) {
          setSuccess('FAQ updated successfully!');
          
          setFaqs(prev => 
            prev.map(f => 
              f.id === editingId 
                ? { ...f, ...payload } 
                : f
            ).sort((a, b) => a.sorting - b.sorting)
          );
          handleCancelEdit();
        } else {
          setError(result.error || 'Failed to update FAQ.');
        }
      } else {
        // Create Action
        const result = await createSiteFaqAction(payload);
        if (result.success) {
          setSuccess('FAQ created successfully!');
          
          const tempId = Date.now().toString();
          setFaqs(prev => [
            ...prev, 
            { 
              ...payload, 
              id: parseInt(tempId) || 0
            }
          ].sort((a, b) => a.sorting - b.sorting));
          
          resetForm();
        } else {
          setError(result.error || 'Failed to create FAQ.');
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
    setQuestionInput('');
    setAnswerInput('');
    setSortingInput('0');
  };

  // Start Editing
  const handleStartEdit = (faq: SiteFaqItem) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(faq.id);

    setQuestionInput(faq.question);
    setAnswerInput(faq.answer);
    setSortingInput(faq.sorting.toString());
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  // Delete FAQ
  const handleDelete = async (faq: SiteFaqItem) => {
    if (!confirm(`Are you sure you want to delete the FAQ "${faq.question.substring(0, 40)}..."?`)) return;

    setError(null);
    setSuccess(null);

    const originalFaqs = [...faqs];
    setFaqs(prev => prev.filter(f => f.id !== faq.id));

    const result = await deleteSiteFaqAction(faq.id);
    if (result.success) {
      setSuccess('FAQ deleted successfully.');
      startTransition(() => {});
    } else {
      setError(result.error || 'Failed to delete FAQ.');
      setFaqs(originalFaqs);
    }
  };

  // Filter
  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Site FAQs</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-650/10">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Site FAQs</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage global Frequently Asked Questions displayed on the site pages</p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Data Table (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 px-3">FAQs List ({filteredFaqs.length})</span>
            <div className="relative group w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search FAQs..."
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
                    <th className="py-4 px-5 w-1/3">Question</th>
                    <th className="py-4 px-5 w-1/2">Answer</th>
                    <th className="py-4 px-5">Sort</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {filteredFaqs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <HelpCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No FAQs found.
                      </td>
                    </tr>
                  ) : (
                    filteredFaqs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-slate-50/50 transition-colors align-top">
                        
                        {/* Column 1: Question */}
                        <td className="py-4 px-5">
                          <span className="font-extrabold text-slate-900 text-sm leading-snug block">{faq.question}</span>
                        </td>

                        {/* Column 2: Answer */}
                        <td className="py-4 px-5">
                          <p className="text-slate-500 font-semibold text-xs leading-relaxed line-clamp-3">{faq.answer}</p>
                        </td>

                        {/* Column 3: Sorting Order */}
                        <td className="py-4 px-5">
                          <span className="font-mono text-slate-550 font-bold text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                            {faq.sorting}
                          </span>
                        </td>

                        {/* Column 4: Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(faq)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit FAQ"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(faq)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete FAQ"
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
                {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                {isEditing ? 'Modify FAQ details' : 'Register a new Question-Answer entry'}
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
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Question Title*</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. What makes treatment different?"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Answer Text*</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Answer text content detail..."
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-850 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sorting Weight</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={sortingInput}
                  onChange={(e) => setSortingInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-mono font-bold text-slate-800"
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
                      {isEditing ? 'Update FAQ' : 'Create FAQ'}
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
