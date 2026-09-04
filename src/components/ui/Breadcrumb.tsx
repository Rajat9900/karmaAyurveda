import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm md:text-base text-green-100 font-medium mt-6 md:mt-8 flex-wrap">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.href ? (
            <Link href={item.href} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
          {idx < items.length - 1 && (
            <span className="text-[#d2621a] font-bold">/</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
