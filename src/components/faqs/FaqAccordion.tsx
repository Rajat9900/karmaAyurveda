"use client";
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqAccordionProps {
  faqs: { question: string; answer: string }[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-[#f4fbf6]">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e3b] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to some of the most common questions our patients have about our Ayurvedic treatments.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index} 
                className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 border ${
                  isOpen ? 'border-[#1f4229] shadow-md' : 'border-gray-100 shadow-sm hover:border-green-200'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`font-bold text-lg md:text-xl pr-4 transition-colors duration-300 ${
                    isOpen ? 'text-[#1f4229]' : 'text-[#1a2e3b]'
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-[#1f4229] text-white rotate-180' : 'bg-green-50 text-[#1f4229]'
                  }`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 mt-2">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-[#1a2e3b] mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6">Our health experts are here to help you make the right decision.</p>
          <a 
            href="tel:9971928080" 
            className="inline-flex items-center gap-2 bg-[#ffcc33] text-black px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#e6b82e] transition-all transform hover:-translate-y-1"
          >
            Call Us Now
          </a>
        </div>
      </div>
    </section>
  );
}
