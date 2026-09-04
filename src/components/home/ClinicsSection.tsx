import React from 'react';
import { MapPin, Building2, Landmark, Castle } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';

const locations = [
  { name: 'Delhi', icon: Landmark },
  { name: 'Jaipur', icon: Castle },
  { name: 'Patna', icon: Building2 },
  { name: 'Bangalore', icon: Building2 },
  { name: 'Mumbai', icon: Landmark },
  { name: 'Lucknow', icon: Castle },
  { name: 'Noida', icon: Building2 },
  { name: 'Lucknow - Vikas Nagar', icon: Castle },
  { name: 'Gurugram', icon: Building2 },
  { name: 'Pratap Nagar', icon: Building2 },
  { name: 'Delhi - Janakpuri', icon: Landmark },
];

export default function ClinicsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <SectionHeading 
          badge="Find Us Near You"
          title={<>Our Clinics <span className="font-normal">(हमारे क्लिनिक)</span></>}
          subtitle="Visit your nearest Karma Ayurveda center and connect with our experts for personalized consultation."
        />

        {/* Clinics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
          {locations.map((loc, idx) => {
            const Icon = loc.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col group">
                
                {/* Location Header */}
                <div className="bg-[#1f3747] text-white py-3 px-4 flex items-center justify-center gap-2">
                  <MapPin size={16} className="text-white/80" />
                  <span className="font-semibold text-sm">{loc.name}</span>
                </div>
                
                {/* Icon/Illustration Area */}
                <div className="py-10 flex justify-center items-center opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  <Icon size={48} strokeWidth={1} className="text-[#1f3747]" />
                </div>
                
                {/* Button Area */}
                <div className="px-6 pb-6 mt-auto">
                  <button className="w-full py-2.5 rounded-full border border-[#d2621a] text-[#d2621a] font-semibold text-sm hover:bg-[#d2621a] hover:text-white transition-colors duration-300">
                    Book Appointment
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="text-center max-w-lg mx-auto">
          <p className="text-gray-500 text-sm mb-6">
            Discover all our treatment centers across India and choose the one closest to you
          </p>
          <a href="/locations" className="inline-block bg-[#1f3747] text-white px-8 py-3 rounded-md font-semibold text-sm hover:bg-[#152733] transition-colors shadow-md">
            Explore All Locations &rarr;
          </a>
          
          <div className="mt-8 text-xs text-gray-400">
            Karma Ayurveda Delhi Address: Second Floor, 77, Block G, Tarun Enclave, Pitampura, New Delhi, Delhi, 110034
          </div>
        </div>
      </div>
    </section>
  );
}
