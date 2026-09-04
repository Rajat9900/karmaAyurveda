"use client";
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqsData = [
  {
    question: "What is the success rate of your Ayurvedic treatment for kidney diseases?",
    answer: "Our Ayurvedic treatment has a very high success rate in halting disease progression and improving kidney function naturally. Over 1.5 lakh patients have experienced significant improvements, avoiding dialysis and transplants through our personalized, holistic approach."
  },
  {
    question: "Do I need to stop dialysis immediately once I start the treatment?",
    answer: "No, you should not stop dialysis immediately. Our treatment works gradually to rejuvenate the kidneys. As your kidney function improves (which will be reflected in your reports), we will advise you on slowly reducing the frequency of dialysis under close medical supervision."
  },
  {
    question: "Are there any side effects of the Ayurvedic medicines?",
    answer: "Karma Ayurveda uses 100% natural, herbal formulations that are rooted in ancient Vedic texts. When taken under the guidance of our experienced doctors, these medicines are completely safe and do not cause any harmful side effects."
  },
  {
    question: "How long does it take to see results?",
    answer: "The timeline for improvement varies depending on the severity of the condition, patient's age, and adherence to the prescribed diet and lifestyle changes. However, many patients start noticing positive changes in their symptoms and lab reports within 3 to 6 months."
  },
  {
    question: "Is diet important during the treatment?",
    answer: "Yes, diet plays a crucial role in Ayurvedic healing (Vihar). We provide a customized renal diet plan tailored to your specific condition. Strictly following this diet is essential for the medicines to work effectively and for the kidneys to heal."
  },
  {
    question: "Can Ayurveda help if my creatinine levels are very high?",
    answer: "Yes, Ayurveda focuses on treating the root cause of the disease. Through specific herbs (Shaman) and detox therapies (Shodhan), we aim to improve the filtration capacity of the kidneys, which naturally helps in lowering elevated creatinine and urea levels over time."
  }
];

export default function FaqAccordion() {
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
          {faqsData.map((faq, index) => {
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
