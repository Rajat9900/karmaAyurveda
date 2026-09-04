"use client";
import { Leaf, Shield, Heart, Clock } from 'lucide-react';

export default function AboutKarmaAyurveda() {
  const features = [
    { icon: <Leaf size={24} />, title: "100% Ayurvedic", desc: "Rooted in ancient Vedic wisdom" },
    { icon: <Shield size={24} />, title: "Safe & Natural", desc: "No harmful side effects" },
    { icon: <Heart size={24} />, title: "Holistic Care", desc: "Treating the cause, not just symptoms" },
    { icon: <Clock size={24} />, title: "84+ Years Legacy", desc: "Trusted across generations" }
  ];

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block py-1.5 px-4 rounded-full bg-green-50 text-[#1f4229] text-xs font-bold tracking-wider uppercase mb-4 shadow-sm border border-green-100">
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a2e3b] mb-6">
            About Karma Ayurveda
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Since 1937, Karma Ayurveda has been a beacon of hope for millions, blending traditional 
            Ayurvedic principles with modern medical insights to offer holistic, natural healing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-[#e1f5e8] rounded-3xl transform -rotate-3 scale-105 -z-10"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://www.karmaayurveda.com/new/assets/image/about-us-img.jpg" 
              alt="Karma Ayurveda Clinic" 
              className="w-full h-auto rounded-3xl shadow-xl object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"; // Fallback image
              }}
            />
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#1a2e3b] mb-4">
                A Legacy of Natural Healing
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Founded by Dr. Arjan Dass in 1937 in New Delhi, India, Karma Ayurveda started with a vision 
                to heal the world using the profound science of Ayurveda. Over eight decades and five generations 
                later, we continue to uphold this vision, specializing in the natural treatment of kidney diseases, 
                liver disorders, cancer, and more.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#1f4229] mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                To provide authentic, effective, and accessible Ayurvedic healthcare that stops disease progression, 
                rejuvenates the body, and eliminates the need for invasive procedures like dialysis or transplants.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              {features.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="bg-[#f4fbf6] p-3 rounded-xl text-[#1f4229]">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a2e3b] text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
