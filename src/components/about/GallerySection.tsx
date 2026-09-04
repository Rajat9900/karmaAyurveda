import React from 'react';

export default function GallerySection() {
  const images = [
    { url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80", alt: "Hospital Reception" },
    { url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80", alt: "Consultation Room" },
    { url: "https://images.unsplash.com/photo-1512069772995-ec65874136f3?auto=format&fit=crop&w=600&q=80", alt: "Ayurvedic Herbs" },
    { url: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80", alt: "Therapy Room" },
    { url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80", alt: "Medicines" },
    { url: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80", alt: "Patient Care" }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block py-1.5 px-4 rounded-full bg-green-50 text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
            Visual Tour
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e3b] mb-4">
            Our Gallery
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take a look inside our state-of-the-art facilities designed for comfort, healing, and peace.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img.url} 
                alt={img.alt}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white font-semibold p-4 md:p-6 text-sm md:text-base translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {img.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
           <button className="border-2 border-[#1f4229] text-[#1f4229] px-8 py-3 rounded-full font-bold hover:bg-[#1f4229] hover:text-white transition-all duration-300">
             View All Photos
           </button>
        </div>
      </div>
    </section>
  );
}
