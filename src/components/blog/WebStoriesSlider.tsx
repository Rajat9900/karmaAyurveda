'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import { WebStory } from '@/app/actions/webStoryActions';

interface WebStoriesSliderProps {
  stories: WebStory[];
}

const AUTO_SLIDE_INTERVAL = 3500;

export default function WebStoriesSlider({ stories }: WebStoriesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  if (stories.length === 0) return null;

  const advance = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild instanceof HTMLElement ? el.firstElementChild.offsetWidth + 24 : 260;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (direction === 'right' && el.scrollLeft >= maxScroll - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === 'left' && el.scrollLeft <= 10) {
      el.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
    }
  }, []);

  // Auto-slide, paused while the user is hovering/interacting with the slider
  useEffect(() => {
    if (stories.length <= 4) return;
    const interval = setInterval(() => {
      if (!isPaused.current) {
        advance('right');
      }
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [advance, stories.length]);

  return (
    <section
      className="py-16 md:py-20 bg-gradient-to-b from-[#fcfdfc] to-[#f3f9f4] border-t border-gray-100"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a2e3b] flex items-center gap-2">
            <Sparkles size={22} className="text-[#d2621a]" />
            Web Stories
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => advance('left')}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-[#1f4229] hover:border-[#1f4229] transition-colors cursor-pointer"
              aria-label="Previous stories"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => advance('right')}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-[#1f4229] hover:border-[#1f4229] transition-colors cursor-pointer"
              aria-label="Next stories"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/web-stories/${story.slug}`}
              className="snap-start group relative flex-shrink-0 w-[calc(50%-12px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] aspect-[9/16] rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gray-100"
            >
              {story.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={story.cover_image}
                  alt={story.meta_title || story.slug}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3 right-3 flex gap-1">
                {Array.from({ length: Math.max(story.panel_count || 1, 1) }).map((_, i) => (
                  <span key={i} className="h-0.5 flex-1 rounded-full bg-white/60" />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-xs font-bold leading-snug line-clamp-3">
                  {story.meta_title || story.slug}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
