import React from 'react';
import { Star, Quote } from 'lucide-react';

const textData = [
  {
    patientName: "Sanjay Gupta",
    treatment: "Kidney Failure",
    review: "I was told by multiple doctors that dialysis was my only option. Coming to Karma Ayurveda was the best decision of my life. Within 6 months of their Ayurvedic treatment, my creatinine levels dropped significantly, and I avoided dialysis completely. Dr. Puneet is a lifesaver.",
    location: "Delhi, India"
  },
  {
    patientName: "Priya Singh",
    treatment: "PCOD & Lifestyle Disorders",
    review: "The holistic approach taken by the doctors here is incredible. They didn't just give me medicines; they changed my diet and lifestyle. I feel healthier and more energetic than I have in years. Highly recommended for anyone looking for natural healing.",
    location: "Mumbai, India"
  },
  {
    patientName: "Ramesh Tiwari",
    treatment: "Fatty Liver",
    review: "After struggling with fatty liver grade 2, I decided to try Ayurveda. The personalized herbal medicines and diet plan worked wonders. My ultrasound is now clear. The staff is very supportive and explains everything clearly.",
    location: "Lucknow, India"
  },
  {
    patientName: "Anjali Desai",
    treatment: "Chronic Kidney Disease",
    review: "Karma Ayurveda gave me hope when I had none. Their 100% natural approach and constant guidance throughout my treatment helped me regain my health. My GFR has improved, and I am living a normal life now.",
    location: "Ahmedabad, India"
  },
  {
    patientName: "Vikas Malhotra",
    treatment: "Diabetes & Hypertension",
    review: "Managing my blood sugar and BP was a daily struggle until I started treatment here. The Ayurvedic herbs have no side effects and have stabilized my condition beautifully. Thank you, Karma Ayurveda!",
    location: "Chandigarh, India"
  },
  {
    patientName: "Sunita Verma",
    treatment: "Joint Pain & Arthritis",
    review: "The Panchakarma therapies provided here are authentic and very effective. My joint pain has reduced drastically, and my mobility has improved. The clinic environment is very peaceful.",
    location: "Jaipur, India"
  }
];

export default function TextTestimonials() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block py-1.5 px-4 rounded-full bg-green-50 text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
            Patient Reviews
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e3b] mb-4">
            What Our Patients Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read written reviews and experiences from thousands of satisfied patients across the globe.
          </p>
        </div>

        {/* Masonry-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {textData.map((testimonial, idx) => (
            <div key={idx} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative">
              {/* Quote Icon Background */}
              <div className="absolute top-6 right-6 text-green-100/50">
                <Quote size={64} fill="currentColor" />
              </div>
              
              <div className="relative z-10">
                {/* 5 Stars */}
                <div className="flex gap-1 mb-4 text-[#ffcc33]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-gray-700 leading-relaxed mb-8 italic">
                  "{testimonial.review}"
                </p>
                
                {/* Patient Info */}
                <div className="border-t border-gray-200 pt-4 mt-auto">
                  <h4 className="font-bold text-[#1a2e3b]">{testimonial.patientName}</h4>
                  <p className="text-sm font-semibold text-[#1f4229] mb-1">{testimonial.treatment}</p>
                  <p className="text-xs text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
