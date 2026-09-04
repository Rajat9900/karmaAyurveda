import React from 'react';

const panelPartners = [
  { name: 'ECHS', icon: '/images/echs.png' },
  { name: 'CGHS', icon: '/images/cghs.png' },
  { name: 'CAPF', icon: '/images/capf.png' },
];

export default function InsuranceSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-[#1f4229] rounded-[2rem] p-8 md:p-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: On Panel */}
            <div className="lg:col-span-5 flex justify-center items-center gap-2 sm:gap-4">
              {panelPartners.map((panel, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 w-28 sm:w-32 flex-shrink-0 flex flex-col items-center justify-center border border-gray-100 hover:shadow-md transition-shadow">
                  <span className="text-xs font-bold text-[#1f4229] mb-3">ON PANEL</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={panel.icon} alt={panel.name} className="w-16 h-16 object-contain mb-3" />
                  <span className="font-bold text-gray-800 text-sm">{panel.name}</span>
                </div>
              ))}
            </div>

            {/* Right: Insurance Providers */}
            <div className="lg:col-span-7">
              <h3 className="text-2xl font-bold text-[#fff] mb-8 text-center lg:text-left">
                All Major Insurance Covered
              </h3>
              
              <div className="flex justify-center lg:justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/insurance-logos.jpg" 
                  alt="Major Insurance Providers" 
                  className="max-w-full h-auto object-contain drop-shadow-sm" 
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
