'use client';

import React, { useState } from 'react';
import { X, GraduationCap } from 'lucide-react';
import { CourseItem } from '@/app/actions/courseActions';
import { submitLeadAction } from '@/app/actions/leadActions';

interface CoursesGridClientProps {
  courses: CourseItem[];
}

export default function CoursesGridClient({ courses }: CoursesGridClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = (courseTitle: string) => {
    setSelectedCourseTitle(courseTitle);
    setSubmitted(false);
    setError(null);
    setName('');
    setPhone('');
    setEmail('');
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('disease', selectedCourseTitle);
      formData.append('message', `Course booking enquiry for "${selectedCourseTitle}"`);

      const result = await submitLeadAction(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit your enquiry. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
        <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-semibold">No courses published yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
          >
            <div className="relative h-52 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-gray-800 mb-2 leading-snug">
                {course.title}
              </h3>
              {course.description && (
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {course.description}
                </p>
              )}
              {course.price && (
                <p className="text-green-600 font-bold text-base mb-3">{course.price}</p>
              )}
              <div className="text-sm text-gray-800 space-y-1 mb-6 flex-grow">
                {course.eligibility && (
                  <p><span className="font-bold">Eligibility:</span> {course.eligibility}</p>
                )}
                {course.mode && (
                  <p><span className="font-bold">Mode:</span> {course.mode}</p>
                )}
                {course.duration && (
                  <p><span className="font-bold">Duration:</span> {course.duration}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => openModal(course.title)}
                className="mt-auto block text-center bg-[#f2b90c] hover:bg-[#e0a800] text-gray-900 font-extrabold text-sm py-3 rounded-xl transition-colors cursor-pointer"
              >
                Book Your Seat
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1f4229] px-6 py-4 flex items-center justify-between sticky top-0">
              <h3 className="text-white text-xl font-bold">Book Your Seat</h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-6">
                  <p className="text-lg font-bold text-[#1f4229] mb-2">Thank you!</p>
                  <p className="text-gray-600 text-sm">
                    We&apos;ve received your enquiry for &quot;{selectedCourseTitle}&quot; and will contact you soon.
                  </p>
                  <button
                    onClick={closeModal}
                    className="mt-6 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <p className="text-sm text-red-600 font-semibold">{error}</p>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-800 block">Selected Course</label>
                    <select
                      value={selectedCourseTitle}
                      onChange={(e) => setSelectedCourseTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] bg-white"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-800 block">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-800 block">Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-800 block">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 mt-4 rounded-xl bg-[#f2b90c] hover:bg-[#e0a800] text-gray-900 font-extrabold text-sm transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
