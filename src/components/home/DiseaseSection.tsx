import React from 'react';
import SectionHeading from '../ui/SectionHeading';

interface SuccessStory {
  videoId: string;
  thumbnailUrl: string;
}

interface DiseaseProps {
  title: string;
  description: string[];
  videoId: string;
  thumbnailUrl: string;
  reverse?: boolean;
  successStories?: SuccessStory[];
}

const DiseaseBlock = ({ title, description, videoId, thumbnailUrl, reverse = false, successStories = [] }: DiseaseProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 hover:shadow-2xl transition-all duration-500 mb-12 relative overflow-hidden group">
      {/* Decorative background shape */}
      <div className={`absolute ${reverse ? '-left-32' : '-right-32'} top-0 w-80 h-80 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none group-hover:bg-green-100 transition-colors duration-500`} />

      <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center relative z-10`}>
        {/* Text Content */}
        <div className="flex-1 space-y-6">
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#0d2a45] flex items-center">
            <span className="w-1.5 h-8 md:h-10 bg-[#165a31] mr-4 rounded-full shadow-sm"></span>
            {title}
          </h3>
          
          <ul className="space-y-4 pt-2">
            {description.map((item, index) => (
              <li key={index} className="flex items-start text-gray-600 leading-relaxed text-base md:text-lg">
                <svg className="w-6 h-6 text-[#165a31] mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <a href={`/${title.toLowerCase().replace(/\s+/g, '-')}`} className="group/btn inline-flex items-center gap-2 px-7 py-3 bg-[#f0fcf4] text-[#165a31] font-bold rounded-full hover:bg-[#165a31] hover:text-white transition-all duration-300 shadow-sm border border-[#d1f2dd] hover:border-[#165a31]">
              Read More
              <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
        
        {/* Main Video Thumbnail */}
        <div className="flex-1 w-full">
          <div className="rounded-2xl overflow-hidden shadow-lg relative cursor-pointer aspect-video bg-gray-100 border-4 border-white group/vid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailUrl} alt={`${title} Video`} className="w-full h-full object-cover transform group-hover/vid:scale-105 transition-transform duration-700" />
            
            <div className="absolute inset-0 bg-black/10 group-hover/vid:bg-black/40 transition-colors duration-300 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#e63946] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(230,57,70,0.6)] group-hover/vid:scale-110 group-hover/vid:bg-[#d62828] transition-all duration-300 mb-2">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white font-bold tracking-[0.15em] text-xs uppercase text-shadow-sm">
                Watch Video
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories Section */}
      {successStories.length > 0 && (
        <div className="mt-10 pt-8 border-t border-gray-100 relative z-10">
          <div className="bg-[#fdf7f0] border-l-4 border-l-[#d2621a] border-r-4 border-r-[#205128] py-3 px-4 rounded-sm mb-6 text-center shadow-sm">
            <h4 className="text-lg md:text-xl font-bold text-black">Success Stories</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {successStories.map((story, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden shadow-md cursor-pointer group bg-white border border-gray-200">
                <div className="aspect-[16/9] relative bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={story.thumbnailUrl} alt="Success Story" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                       <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>
                <div className="bg-[#fc3c3c] text-white py-2.5 text-center text-sm font-bold flex items-center justify-center gap-1.5 group-hover:bg-red-600 transition-colors">
                  <span>▶</span> Watch Video
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function DiseaseSection() {
  const diseases = [
    {
      title: 'Kidney Disease',
      description: [
        'Kidney diseases are conditions where the kidneys become weak, damaged, or cannot function properly.',
        'Healthy kidneys help remove waste, balance body fluids, and control blood pressure.',
        'When they are affected by infections, diabetes, or high blood pressure, their ability to filter blood decreases.',
        'Over time, this damage can cause waste and fluids to build up in the body.'
      ],
      videoId: 'b1-TE2uzmos',
      thumbnailUrl: 'https://img.youtube.com/vi/b1-TE2uzmos/hqdefault.jpg',
      reverse: false,
      successStories: [
        { videoId: 'kidney_ss1', thumbnailUrl: 'https://img.youtube.com/vi/b1-TE2uzmos/hqdefault.jpg' },
        { videoId: 'kidney_ss2', thumbnailUrl: 'https://img.youtube.com/vi/IdSQ2EcJnxE/hqdefault.jpg' }
      ]
    },
    {
      title: 'Cancer',
      description: [
        'Cancer is a life-threatening disease caused by the uncontrolled growth of abnormal cells in the body.',
        'Normally, body cells divide, grow, and die in a regular cycle.',
        'When this process is disturbed, cells begin to multiply uncontrollably.',
        'These abnormal cells gather in one area, forming cysts or tumors that can spread to other parts of the body.'
      ],
      videoId: 'igRAgRP9KvM',
      thumbnailUrl: 'https://img.youtube.com/vi/igRAgRP9KvM/hqdefault.jpg',
      reverse: true,
      successStories: [
        { videoId: 'cancer_ss1', thumbnailUrl: 'https://img.youtube.com/vi/igRAgRP9KvM/hqdefault.jpg' },
        { videoId: 'cancer_ss2', thumbnailUrl: 'https://img.youtube.com/vi/b1-TE2uzmos/hqdefault.jpg' }
      ]
    },
    {
      title: 'Liver Disease',
      description: [
        'Liver diseases are a group of conditions that damage the liver, which can lead to life-threatening complications.',
        'These diseases affect the liver\'s ability to perform its functions.',
        'When the liver is harmed, it can lead to liver disease symptoms like jaundice or swelling.',
        'Damaged liver cells may turn into scar tissue, and this affects the liver\'s function.'
      ],
      videoId: 'IdSQ2EcJnxE',
      thumbnailUrl: 'https://img.youtube.com/vi/IdSQ2EcJnxE/hqdefault.jpg',
      reverse: false,
      successStories: [
        { videoId: 'liver_ss1', thumbnailUrl: 'https://img.youtube.com/vi/IdSQ2EcJnxE/hqdefault.jpg' },
        { videoId: 'liver_ss2', thumbnailUrl: 'https://img.youtube.com/vi/igRAgRP9KvM/hqdefault.jpg' }
      ]
    }
  ];

  return (
    <section className="py-20 bg-[#f4fbf6] border-y border-[#eafaf0] relative">
      {/* Background abstract shape */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-green-50/50 to-transparent pointer-events-none"></div>
      <div className="container mx-auto px-4 max-w-6xl">
        <SectionHeading 
          title="Diseases and Conditions We Reverse" 
          subtitle="Karma Ayurveda Helps to Reverse Life-Threatening Diseases at the Root Level Naturally"
        />
        
        <div className="mt-16">
          {diseases.map((disease, idx) => (
            <DiseaseBlock key={idx} {...disease} />
          ))}
        </div>
        
        <div className="text-center mt-8">
           <a href="/all-diseases" className="inline-block px-8 py-3 bg-[#1f4229] text-white font-bold rounded-sm hover:bg-[#2e5339] shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5">
             Explore All Conditions
           </a>
        </div>
      </div>
    </section>
  );
}