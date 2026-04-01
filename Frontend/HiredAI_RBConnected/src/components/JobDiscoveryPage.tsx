import JobDiscovery from '../imports/JobDiscovery';
import { useEffect, useState } from 'react';

interface JobDiscoveryPageProps {
  onNavigate: (page: 'home' | 'dashboard' | 'signin' | 'login' | 'resume1' | 'resume2' | 'resume3' | 'jobs' | 'templates') => void;
}

export default function JobDiscoveryPage({ onNavigate }: JobDiscoveryPageProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const designWidth = 1728;
      const designHeight = 1120;
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
    <div className="fixed inset-0 bg-white overflow-auto">
      {/* Container for scaled content */}
      <div 
        className="relative w-full min-h-full flex items-center justify-center"
      >
        {/* Scaled wrapper */}
        <div 
          className="relative origin-center"
          style={{
            width: '1728px',
            height: '1120px',
            transform: `scale(${scale})`,
          }}
        >
          {/* Original Figma Design */}
          <JobDiscovery />
          
          {/* Clickable overlays for navigation - maintaining exact Figma positions */}
          
          {/* Home/Logo - top left in sidebar */}
          <button
            onClick={() => onNavigate('home')}
            className="absolute left-0 top-0 w-[356px] h-[95px] cursor-pointer z-10 hover:bg-black/5 hover:opacity-80 transition-all duration-150"
            aria-label="Go to Home"
          />
          
          {/* Agents button in sidebar */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="absolute left-[16px] top-[139px] w-[324px] h-[39px] cursor-pointer z-10 hover:bg-gray-50 hover:scale-105 transition-all duration-150 rounded-[8px]"
            aria-label="Go to Dashboard - Agents"
          />
          
          {/* Shortlisted button in sidebar */}
          <button
            onClick={() => onNavigate('jobs')}
            className="absolute left-[16px] top-[192px] w-[324px] h-[39px] cursor-pointer z-10 hover:bg-gray-50 hover:scale-105 transition-all duration-150 rounded-[8px]"
            aria-label="Shortlisted Jobs"
          />
          
          {/* Support button in sidebar */}
          <button
            className="absolute left-[28px] top-[954px] w-[232px] h-[33px] cursor-pointer z-10 hover:bg-gray-50 hover:scale-105 transition-all duration-150 rounded-[8px]"
            aria-label="Support"
          />
          
          {/* Account Settings button in sidebar */}
          <button
            className="absolute left-[28px] top-[1001px] w-[232px] h-[28px] cursor-pointer z-10 hover:bg-gray-50 hover:scale-105 transition-all duration-150 rounded-[8px]"
            aria-label="Account Settings"
          />
          
          {/* Job card 1 - clickable */}
          <button
            className="absolute left-[474px] top-[67px] w-[1100px] h-[239px] cursor-pointer z-10 hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 rounded-[30px]"
            aria-label="View job details for Data Analyst - Meta1"
          />
          
          {/* Job card 2 - clickable */}
          <button
            className="absolute left-[474px] top-[334px] w-[1100px] h-[239px] cursor-pointer z-10 hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 rounded-[30px]"
            aria-label="View job details for Data Analyst - Meta2"
          />
          
          {/* Job card 3 - clickable */}
          <button
            className="absolute left-[474px] top-[601px] w-[1100px] h-[239px] cursor-pointer z-10 hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 rounded-[30px]"
            aria-label="View job details for Data Analyst - Meta3"
          />
        </div>
      </div>
    </div>
  );
}
