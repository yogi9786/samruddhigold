import React, { useRef, useEffect } from 'react';
import videoLandscape from '../assets/loader landscape.mp4';
import videoPortrait  from '../assets/loader portraite.mp4';

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {/* autoplay blocked — silently ignored */});
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '100svh' }}>
      {/* ── Landscape video (md+) ── */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="hidden md:block absolute inset-0 w-full h-full object-cover"
        src={videoLandscape}
      />

      {/* ── Portrait video (mobile) ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="block md:hidden absolute inset-0 w-full h-full object-cover"
        src={videoPortrait}
      />

      {/* Gradient overlay — darker at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 z-10" />

      {/* Optional bottom caption */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-3 px-4">
        <div className="flex items-center gap-3">
          <span className="block w-8 h-[1px] bg-white/50" />
          <span className="font-sans text-white/70 text-[10px] tracking-[3px] uppercase font-semibold">
            Shop By Category
          </span>
          <span className="block w-8 h-[1px] bg-white/50" />
        </div>
        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-1 animate-bounce">
          <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
