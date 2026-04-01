import ResumeBuider1 from '../imports/ResumeBuider1';
import { useEffect, useState } from 'react';

import { Page } from "../App";

interface ResumeBuilder1Props {
  onNavigate: (page: Page) => void;
}

export default function ResumeBuilder1({ onNavigate }: ResumeBuilder1Props) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const designWidth = 1728;
      const designHeight = 1361;
      const scaleX = window.innerWidth / designWidth;
      const scaleY = window.innerHeight / designHeight;
      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  return (
    <div className="w-screen h-screen bg-white overflow-auto flex items-center justify-center">
      {/* Container for scaled content */}
      <div 
        className="relative flex-shrink-0 my-4"
        style={{
          width: `${1728 * scale}px`,
          height: `${1361 * scale}px`,
        }}
      >
        {/* Scaled wrapper */}
        <div 
          className="relative origin-top-left"
          style={{
            width: '1728px',
            height: '1361px',
            transform: `scale(${scale})`,
          }}
        >
          {/* Original Figma Design */}
          <ResumeBuider1 />
          
          {/* Clickable overlays for navigation - maintaining exact Figma positions */}
          
          {/* Back button - navigate back to templates */}
          <button
            onClick={() => onNavigate('templates')}
            className="absolute left-[40px] top-[40px] w-[120px] h-[40px] cursor-pointer z-10 flex items-center justify-center gap-2 hover:bg-black/5 rounded-lg transition-all duration-150 hover:scale-105"
            aria-label="Back to Templates"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-['Poppins:Medium',sans-serif] text-sm">Back</span>
          </button>
          
          {/* Template cards - all 12 templates with micro-interactions */}
          {Array.from({ length: 12 }).map((_, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            const left = 55 + col * 413;
            const top = 135 + row * 550;
            
            return (
              <button
                key={index}
                onClick={() => onNavigate('resume2')}
                className="absolute w-[379px] h-[502px] cursor-pointer z-10 hover:scale-[1.02] transition-all duration-150 hover:shadow-2xl rounded-lg"
                style={{ left: `${left}px`, top: `${top}px` }}
                aria-label={`Select template ${index + 1}`}
              />
            );
          })}
          
          {/* Continue button at bottom right */}
          <button
            onClick={() => onNavigate('resume2')}
            className="absolute left-[1482px] top-[1239px] w-[191px] h-[49px] cursor-pointer z-10 hover:bg-neutral-700 hover:scale-105 transition-all duration-150 rounded-[8px] hover:shadow-lg"
            aria-label="Continue to next step"
          />
        </div>
      </div>
    </div>
  );
}
