import React from 'react';

interface SectionHeadingProps {
  title: React.ReactNode | string;
  subtitle?: React.ReactNode | string;
  badge?: string;
  className?: string;
}

export default function SectionHeading({ title, subtitle, badge, className = '' }: SectionHeadingProps) {
  return (
    <div className={`text-center max-w-2xl mx-auto mb-16 ${className}`}>
      {badge && (
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 font-bold text-xs tracking-widest uppercase mb-6">
          {badge}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e3b] mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-500 text-sm md:text-base mb-6">
          {subtitle}
        </p>
      )}
      <div className="w-16 h-1 bg-gradient-to-r from-[#d2621a] to-yellow-500 mx-auto rounded-full"></div>
    </div>
  );
}
