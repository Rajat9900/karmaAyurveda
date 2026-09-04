import React from 'react';

export default function AwardsSection() {
  const awards = [
    { title: "Best Ayurvedic Hospital", year: "2023", image: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=400&q=80" },
    { title: "Excellence in Kidney Care", year: "2022", image: "https://images.unsplash.com/photo-1589828131758-a5b746815340?auto=format&fit=crop&w=400&q=80" },
    { title: "Pioneer in Ayurveda", year: "2021", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
    { title: "Most Trusted Healthcare Brand", year: "2020", image: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&w=400&q=80" }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#f4fbf6] border-y border-[#eafaf0]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
            Recognitions
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e3b] mb-4">
            Awards & Accolades
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our commitment to patient care and natural healing has been recognized globally.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {awards.map((award, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="h-40 rounded-xl overflow-hidden mb-6 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={award.image} 
                  alt={award.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-[#d2621a] mb-2 block">{award.year}</span>
                <h3 className="font-bold text-[#1a2e3b] text-lg leading-tight">{award.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
