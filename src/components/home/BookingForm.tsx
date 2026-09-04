'use client';
import React, { useState, useEffect } from 'react';
import { User, Phone, Stethoscope } from 'lucide-react';
import { submitLeadAction } from '@/app/actions/leadActions';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    disease: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // User is scrolling, hide the form
      setIsScrolling(true);
      
      // Clear the previous timeout
      clearTimeout(scrollTimeout);
      
      // Set a timeout to show the form again after scrolling stops
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 400); // Waits 400ms after last scroll event
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      const result = await submitLeadAction(data);
      if (result.success) {
        alert('Thank you for your enquiry. We will contact you soon.');
        setFormData({ name: '', phone: '', disease: '' });
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

  return (
    <div 
      className={`fixed bottom-0 left-0 w-full z-50 bg-[#eef8f1] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-green-200 transition-transform duration-500 ease-in-out ${
        isScrolling ? 'translate-y-[120%]' : 'translate-y-0'
      }`}
    >
      <div className="container mx-auto px-4 py-4 relative">
        
        {/* Floating WhatsApp Button (Optional alignment with the form) */}
        {/* The user screenshot shows a green Whatsapp icon on the left, but we will focus on the form itself */}

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#1a2e3b]">
              Talk to Our Care Experts
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Fill in your details to get a same-day callback.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-5xl mx-auto">
            
            {/* Name Input */}
            <div className="relative w-full md:w-auto flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400 group-focus-within:text-[#1f4229] transition-colors" />
              </div>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-full text-sm border border-gray-200 focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] outline-none shadow-sm transition-all bg-white text-gray-900 placeholder:text-gray-500"
                placeholder="Enter Your Name"
              />
            </div>
            
            {/* Phone Input */}
            <div className="relative w-full md:w-auto flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400 group-focus-within:text-[#1f4229] transition-colors" />
              </div>
              <input 
                type="tel" 
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-full text-sm border border-gray-200 focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] outline-none shadow-sm transition-all bg-white text-gray-900 placeholder:text-gray-500"
                placeholder="Enter Phone Number"
              />
            </div>
            
            {/* Disease Select */}
            <div className="relative w-full md:w-auto flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Stethoscope size={18} className="text-gray-400 group-focus-within:text-[#1f4229] transition-colors" />
              </div>
              <select 
                name="disease"
                required
                value={formData.disease}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-full text-sm border border-gray-200 focus:ring-2 focus:ring-[#1f4229]/20 focus:border-[#1f4229] outline-none shadow-sm transition-all bg-white appearance-none text-gray-900"
              >
                <option value="" disabled hidden>Select Disease</option>
                <option value="kidney">Kidney Disease</option>
                <option value="cancer">Cancer</option>
                <option value="liver">Liver Disease</option>
                <option value="psoriasis">Psoriasis</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                 <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full md:w-auto md:min-w-[160px] bg-gradient-to-r from-[#1f4229] to-[#2e5339] hover:from-[#2e5339] hover:to-[#1f4229] text-white font-bold text-sm py-3 px-8 rounded-full shadow-[0_4px_15px_rgba(31,66,41,0.3)] transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
