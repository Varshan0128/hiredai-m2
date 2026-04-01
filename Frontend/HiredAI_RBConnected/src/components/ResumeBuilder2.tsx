import ResumeBuider2 from '../imports/ResumeBuider2';
import { useEffect, useState } from 'react';

import { Page } from "../App";

interface ResumeBuilder2Props {
  onNavigate: (page: Page) => void;
}

export default function ResumeBuilder2({ onNavigate }: ResumeBuilder2Props) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const designWidth = 1728;
      const designHeight = 1117;
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
    <div className="w-screen h-screen bg-white overflow-hidden flex items-center justify-center">
      {/* Container for scaled content */}
      <div 
        className="relative flex-shrink-0"
        style={{
          width: `${1728 * scale}px`,
          height: `${1117 * scale}px`,
        }}
      >
        {/* Scaled wrapper */}
        <div 
          className="relative origin-top-left"
          style={{
            width: '1728px',
            height: '1117px',
            transform: `scale(${scale})`,
          }}
        >
          {/* Original Figma Design */}
          <ResumeBuider2 />
          
          {/* Clickable overlays for navigation - maintaining exact Figma positions */}
          
          {/* Back button - exact position from Figma */}
          <button
            onClick={() => onNavigate('resume1')}
            className="absolute left-[40px] top-[996px] w-[159px] h-[50px] cursor-pointer z-10 hover:bg-gray-50 hover:scale-105 transition-all duration-150 rounded-[8px]"
            aria-label="Go back to template selection"
          />
          
          {/* Continue button - exact position from Figma */}
          <button
            onClick={() => onNavigate('resume3')}
            className="absolute left-[1482px] top-[996px] w-[191px] h-[49px] cursor-pointer z-10 hover:bg-neutral-700 hover:scale-105 hover:shadow-lg transition-all duration-150 rounded-[8px]"
            aria-label="Continue to ATS analysis"
          />
        </div>
      </div>
    </div>
  );
}
