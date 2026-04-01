import ResumeBuilder3Import from '../imports/ResumeBuilder3';
import { useEffect, useState } from 'react';

import { Page } from "../App";

interface ResumeBuilder3Props {
  onNavigate: (page: Page) => void;
}

export default function ResumeBuilder3({ onNavigate }: ResumeBuilder3Props) {
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
          <ResumeBuilder3Import />
          
          {/* Clickable overlays for navigation - maintaining exact Figma positions */}
          
          {/* Back button - exact position from Figma */}
          <button
            onClick={() => onNavigate('resume2')}
            className="absolute left-[40px] top-[996px] w-[159px] h-[50px] cursor-pointer z-10 hover:bg-gray-50 hover:scale-105 transition-all duration-150 rounded-[8px]"
            aria-label="Go back to resume editor"
          />
          
          {/* Download Resume button - exact position from Figma */}
          <button
            onClick={() => {
              // Show success message
              const Toast = document.createElement('div');
              Toast.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 32px 48px; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); z-index: 9999; border: 2px solid #262626;">
                  <p style="font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 600; color: #262626; margin: 0;">✓ Resume downloaded successfully!</p>
                </div>
              `;
              document.body.appendChild(Toast);
              setTimeout(() => {
                Toast.remove();
                onNavigate('dashboard');
              }, 1500);
            }}
            className="absolute left-[1417px] top-[996px] w-[256px] h-[49px] cursor-pointer z-10 hover:bg-neutral-700 hover:scale-105 hover:shadow-lg transition-all duration-150 rounded-[8px]"
            aria-label="Download your resume"
          />
        </div>
      </div>
    </div>
  );
}
