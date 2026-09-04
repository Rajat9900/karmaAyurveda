'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Share2, Copy, Check, MessageCircle, Send, AtSign } from 'lucide-react';
import { WebStory } from '@/app/actions/webStoryActions';

interface WebStoryViewerProps {
  story: WebStory;
}

export default function WebStoryViewer({ story }: WebStoryViewerProps) {
  const panels = story.panels || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const current = panels[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < panels.length - 1;

  const goPrev = () => setCurrentIndex(prev => Math.max(0, prev - 1));
  const goNext = () => setCurrentIndex(prev => Math.min(panels.length - 1, prev + 1));

  const shareTitle = story.meta_title || story.slug;

  const handleShareClick = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch {
        // user cancelled the native share sheet — no-op
      }
    } else {
      setShareMenuOpen(prev => !prev);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    setShareMenuOpen(false);
  };

  const handleWhatsAppShare = () => {
    const shareUrl = window.location.href;
    openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`);
  };

  const handleFacebookShare = () => {
    const shareUrl = window.location.href;
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const handleTwitterShare = () => {
    const shareUrl = window.location.href;
    openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`);
  };

  if (panels.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white text-sm font-semibold">
        This story doesn&apos;t have any panels yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-8">
      <div className="relative w-full max-w-[420px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-black select-none">

        {/* Progress Segments */}
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
          {panels.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-300 ${idx <= currentIndex ? 'w-full' : 'w-0'}`}
              />
            </div>
          ))}
        </div>

        {/* Share & Close Buttons */}
        <div className="absolute top-8 right-3 z-30 flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={handleShareClick}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Share story"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {shareMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShareMenuOpen(false)}
                />
                <div className="absolute top-10 right-0 z-40 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden">
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={handleFacebookShare}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    Facebook
                  </button>
                  <button
                    type="button"
                    onClick={handleTwitterShare}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <AtSign className="w-3.5 h-3.5 text-sky-500" />
                    Twitter / X
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          <Link
            href="/blogs"
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            aria-label="Close story"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>

        {/* Panel Image */}
        {current.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={currentIndex}
            src={current.image}
            alt={current.heading}
            className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <ImageIcon className="w-10 h-10 text-gray-500" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

        {/* Tap Zones */}
        <button
          type="button"
          onClick={goPrev}
          disabled={!hasPrev}
          className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer disabled:cursor-default"
          aria-label="Previous panel"
        />
        <button
          type="button"
          onClick={goNext}
          disabled={!hasNext}
          className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer disabled:cursor-default"
          aria-label="Next panel"
        />

        {/* Desktop Arrow Controls */}
        {hasPrev && (
          <button
            type="button"
            onClick={goPrev}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center transition-colors"
            aria-label="Previous panel"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {hasNext && (
          <button
            type="button"
            onClick={goNext}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center transition-colors"
            aria-label="Next panel"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Panel Text */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 pointer-events-none">
          {current.heading && (
            <h2 className="text-white text-2xl font-black leading-snug mb-3 drop-shadow-md">
              {current.heading}
            </h2>
          )}
          {current.paragraph && (
            <p className="text-white/90 text-sm leading-relaxed drop-shadow-md">
              {current.paragraph}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
