'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Search,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import {
  CourseItem,
  createCourseAction,
  updateCourseAction,
  deleteCourseAction
} from '@/app/actions/courseActions';

interface CoursesManagerClientProps {
  initialCourses: CourseItem[];
}

export default function CoursesManagerClient({ initialCourses }: CoursesManagerClientProps) {
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [sortInput, setSortInput] = useState<string>('0');

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

    if (!titleInput.trim() || !linkInput.trim() || !imageInput.trim()) {
      setError('Title, Link, and Image URL are required fields.');
      setSubmitting(false);
      return;
    }

    const payload = {
      title: titleInput.trim(),
      link: linkInput.trim(),
      image: imageInput.trim(),
      sort: parseInt(sortInput) || 0
    };

    try {
      if (isEditing && editingId) {
        // Edit Action
        const result = await updateCourseAction(editingId, payload);
        if (result.success) {
          setSuccess('Course updated successfully!');

          setCourses(prev =>
            prev.map(c =>
              c.id === editingId
                ? { ...c, ...payload }
                : c
            ).sort((a, b) => a.sort - b.sort)
          );
          handleCancelEdit();
        } else {
          setError(result.error || 'Failed to update course.');
        }
      } else {
        // Create Action
        const result = await createCourseAction(payload);
        if (result.success) {
          setSuccess('Course created successfully!');

          const tempId = Date.now().toString();
          setCourses(prev => [
            ...prev,
            {
              ...payload,
              id: parseInt(tempId) || 0
            }
          ].sort((a, b) => a.sort - b.sort));

          resetForm();
        } else {
          setError(result.error || 'Failed to create course.');
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
    setTitleInput('');
    setLinkInput('');
    setImageInput('');
    setSortInput('0');
  };

  // Start Editing
  const handleStartEdit = (course: CourseItem) => {
    setError(null);
    setSuccess(null);
    setIsEditing(true);
    setEditingId(course.id);

    setTitleInput(course.title);
    setLinkInput(course.link);
    setImageInput(course.image);
    setSortInput(course.sort.toString());
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  // Delete Course
  const handleDelete = async (course: CourseItem) => {
    if (!confirm(`Are you sure you want to delete the course "${course.title}"?`)) return;

    setError(null);
    setSuccess(null);

    const originalCourses = [...courses];
    setCourses(prev => prev.filter(c => c.id !== course.id));

    const result = await deleteCourseAction(course.id);
    if (result.success) {
      setSuccess('Course deleted successfully.');
      startTransition(() => {});
    } else {
      setError(result.error || 'Failed to delete course.');
      setCourses(originalCourses);
    }
  };

  // Filter
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.link.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">

      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Our Courses</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-650/10">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Our Courses</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage courses shown on the public Our Courses page</p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column: Data Table (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">

          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 px-3">Courses List ({filteredCourses.length})</span>
            <div className="relative group w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search courses..."
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
                    <th className="py-4 px-5 w-16">Preview</th>
                    <th className="py-4 px-5">Title</th>
                    <th className="py-4 px-5">Link</th>
                    <th className="py-4 px-5">Sort</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <GraduationCap className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No courses found.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50/50 transition-colors align-middle">

                        {/* Column 1: Image Preview */}
                        <td className="py-4 px-5">
                          {course.image ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={course.image}
                                alt={course.title}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <ImageIcon className="w-4 h-4 text-slate-300 absolute z-0" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </td>

                        {/* Column 2: Title */}
                        <td className="py-4 px-5">
                          <span className="font-extrabold text-slate-900 text-sm leading-snug block">{course.title}</span>
                        </td>

                        {/* Column 3: Link */}
                        <td className="py-4 px-5">
                          <a
                            href={course.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold hover:underline"
                          >
                            <span className="truncate max-w-[200px] inline-block text-xs">{course.link}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </td>

                        {/* Column 4: Sorting Order */}
                        <td className="py-4 px-5">
                          <span className="font-mono text-slate-550 font-bold text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                            {course.sort}
                          </span>
                        </td>

                        {/* Column 5: Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(course)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Course"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(course)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Course"
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
                {isEditing ? 'Edit Course' : 'Add New Course'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                {isEditing ? 'Modify course details' : 'Register a new course'}
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
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Course Title*</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Certificate Course in Ayurvedic Nutrition..."
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Course Link URL*</label>
                <input
                  required
                  type="url"
                  placeholder="e.g. https://karmaayurveda.com/courses/enroll"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Image URL*</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/photo-1..."
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                />
              </div>

              {/* Form Image Preview */}
              {imageInput.trim() && (
                <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Image Preview</span>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-150 bg-white flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageInput.trim()}
                      alt="Preview"
                      className="object-contain w-full h-full max-h-32"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <ImageIcon className="w-6 h-6 text-slate-200 absolute z-0" />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sorting Weight</label>
                <input
                  type="number"
                  placeholder="e.g. 0"
                  value={sortInput}
                  onChange={(e) => setSortInput(e.target.value)}
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
                      {isEditing ? 'Update Course' : 'Create Course'}
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
