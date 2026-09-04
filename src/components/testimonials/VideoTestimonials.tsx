import React from 'react';
import { PlayCircle } from 'lucide-react';

const videoData = [
  {
    patientName: "Rajesh Kumar",
    treatment: "Chronic Kidney Disease",
    thumbnail: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
    duration: "3:45",
  },
  {
    patientName: "Meena Sharma",
    treatment: "Dialysis Reversal",
    thumbnail: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80",
    duration: "5:20",
  },
  {
    patientName: "Amit Patel",
    treatment: "Liver Cirrhosis",
    thumbnail: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80",
    duration: "4:10",
  }
];

export default function VideoTestimonials() {
  return (
    <section className="py-16 md:py-24 bg-[#f4fbf6]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
            Real Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e3b] mb-4">
            Video Testimonials
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear directly from our patients about their journey to recovery with Karma Ayurveda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videoData.map((video, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-lg transition-all duration-300">
              {/* Thumbnail Container */}
              <div className="relative aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={video.thumbnail} 
                  alt={`${video.patientName} Testimonial`}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay & Play Button */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <PlayCircle size={64} className="text-white opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300" strokeWidth={1.5} />
                </div>
                
                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              
              {/* Content Details */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-[#1a2e3b] mb-1">{video.patientName}</h3>
                <p className="text-[#d2621a] font-medium text-sm">{video.treatment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
