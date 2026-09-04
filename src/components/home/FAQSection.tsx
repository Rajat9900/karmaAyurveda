'use client';
import React, { useState } from 'react';
import { Plus, Minus, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How to book an appointment in Karma Ayurveda?',
    answer: 'You can easily book an appointment by visiting our website, calling our helpline number, or directly visiting any of our clinic locations near you.'
  },
  {
    question: 'What are the charges at Karma Ayurveda Hospital?',
    answer: 'The charges vary depending on the severity of the condition and the specific Ayurvedic therapies prescribed. We offer transparent pricing after your initial consultation.'
  },
  {
    question: 'What are the main diseases that are managed in Karma Ayurveda Hospital?',
    answer: 'We specialize in reversing kidney diseases, liver disorders, heart problems, skin conditions, and various other chronic and lifestyle diseases using purely Ayurvedic methods.'
  },
  {
    question: 'Does Karma Ayurveda Hospital accept health insurance?',
    answer: 'Yes, we are empaneled with major health insurance providers. You can check our insurance section or contact our billing desk for specific details regarding your policy.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#f4fbf6] relative overflow-hidden">
      {/* Abstract decorative elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[100px] opacity-60 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Column: Sticky Title area */}
          <div className="lg:w-1/3 lg:sticky lg:top-24 h-fit">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm font-bold text-[#d2621a] mb-6 border border-orange-100">
              <MessageCircle size={16} /> Support & Help
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2e3b] leading-tight mb-6">
              Got Questions?<br/>We Have <span className="text-[#1f4229]">Answers.</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Everything you need to know about our treatments, billing, and holistic healing processes. Can't find the answer you're looking for?
            </p>
            <button className="bg-[#d2621a] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-[#b55010] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Contact Our Team
            </button>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:w-2/3 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  className={`bg-white rounded-2xl transition-all duration-300 border-2 ${
                    isOpen ? 'border-[#1f4229] shadow-lg shadow-green-900/5' : 'border-transparent shadow-sm hover:shadow-md'
                  }`}
                >
                  <button 
                    className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span className={`text-lg font-bold transition-colors duration-300 pr-8 ${isOpen ? 'text-[#1f4229]' : 'text-[#1a2e3b]'}`}>
                      {faq.question}
                    </span>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-[#1f4229] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                    </div>
                  </button>
                  
                  <div 
                    className={`px-8 overflow-hidden transition-all duration-500 ease-in-out ${
                      isOpen ? 'max-h-60 pb-8 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
