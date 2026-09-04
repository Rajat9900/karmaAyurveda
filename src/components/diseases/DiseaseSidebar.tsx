'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { submitLeadAction } from '@/app/actions/leadActions';

export default function DiseaseSidebar() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    disease: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('disease', formData.disease);
      data.append('message', formData.message);

      const result = await submitLeadAction(data);
      if (result.success) {
        alert('Thank you for your enquiry. We will contact you soon.');
        setFormData({ name: '', phone: '', disease: '', message: '' });
      } else {
        alert(result.error || 'Failed to submit booking. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const diseasesList = [
    { name: 'Chronic Kidney', slug: 'chronic-kidney' },
    { name: 'Nephrotic Syndrome', slug: 'nephrotic-syndrome' },
    { name: 'Polycystic Kidney Disease', slug: 'polycystic-kidney-disease' },
    { name: 'Kidney Failure', slug: 'kidney-failure' },
    { name: 'Proteinuria', slug: 'proteinuria' },
  ];

  return (
    <div className="space-y-8 sticky top-24">
      {/* Form Widget */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 border border-gray-100">
        <div className="mb-4 bg-gray-50 p-4 rounded-xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Quick Consultation</p>
          <h3 className="text-xl font-bold text-gray-800 leading-tight">Talk to Our Kidney Care Experts</h3>
          <p className="text-xs text-gray-500 mt-2">Fill in your details to get a same-day callback.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name*"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#e98a15]/20 focus:border-[#e98a15] outline-none text-sm transition-all bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-24 px-3 py-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-700 font-medium">
              🇮🇳 +91
            </div>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10 Digit Mobile No*"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#e98a15]/20 focus:border-[#e98a15] outline-none text-sm transition-all bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div>
            <select
              name="disease"
              required
              value={formData.disease}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#e98a15]/20 focus:border-[#e98a15] outline-none text-sm transition-all bg-white text-gray-900 appearance-none"
            >
              <option value="" disabled hidden>Acute Kidney</option>
              <option value="acute-kidney">Acute Kidney Injury</option>
              <option value="chronic-kidney">Chronic Kidney Disease</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <textarea
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell about your Disease/Symptoms Here*"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#e98a15]/20 focus:border-[#e98a15] outline-none text-sm transition-all resize-none bg-white text-gray-900 placeholder:text-gray-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#ef8716] hover:bg-[#d97712] text-white font-bold text-sm py-3 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Booking...' : 'Book an Appointment'}
          </button>
          
          <p className="text-[10px] text-center text-gray-400 mt-3">
            Your details are kept private and shared only for consultation.
          </p>
        </form>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Or Call <a href="tel:9910079079" className="text-[#ef8716] text-lg font-bold">9910079079</a></p>
      </div>

      {/* Diseases Widget */}
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-gray-100">
        <div className="bg-[#1f3a47] text-white py-3 px-4 text-center">
          <h3 className="font-semibold text-sm">Kidney Diseases</h3>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
          {diseasesList.map((d, i) => (
            <Link 
              href={`/${d.slug}`} 
              key={i}
              className="block p-3 border border-gray-100 rounded hover:bg-gray-50 hover:border-gray-200 transition-colors text-sm text-gray-700"
            >
              {d.name}
            </Link>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8; 
        }
      `}} />
    </div>
  );
}
