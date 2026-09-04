import React from 'react';
import Breadcrumb, { BreadcrumbItem } from './Breadcrumb';

interface PageBannerProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumbItems: BreadcrumbItem[];
}

export default function PageBanner({ title, subtitle, breadcrumbItems }: PageBannerProps) {
  return (
    <div className="bg-[#1f4229] py-16 md:py-24 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-green-100 max-w-2xl mx-auto text-lg mt-4">
            {subtitle}
          </p>
        )}
        <Breadcrumb items={breadcrumbItems} />
      </div>
    </div>
  );
}