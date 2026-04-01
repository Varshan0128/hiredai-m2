// import Dashboard from '../imports/Dashboard';
// import { useEffect, useState } from 'react';

// interface DashboardPageProps {
//   onNavigate: (page: 'home' | 'dashboard' | 'signin' | 'login' | 'resume1' | 'resume2' | 'resume3' | 'jobs' | 'templates') => void;
// }

// export default function DashboardPage({ onNavigate }: DashboardPageProps) {
//   const [scale, setScale] = useState(1);

//   useEffect(() => {
//     const calculateScale = () => {
//       const designWidth = 1728;
//       const designHeight = 1117;
//       const padding = 0;
//       const scaleX = (window.innerWidth - padding) / designWidth;
//       const scaleY = (window.innerHeight - padding) / designHeight;
//       const newScale = Math.min(scaleX, scaleY, 1);
//       setScale(newScale);
//     };

//     calculateScale();
//     window.addEventListener('resize', calculateScale);
//     return () => window.removeEventListener('resize', calculateScale);
//   }, []);

//   return (
//     <div className="w-screen h-screen bg-white overflow-hidden flex items-center justify-center">
//       {/* Container for scaled content */}
//       <div
//         className="relative flex-shrink-0"
//         style={{
//           width: `${1728 * scale}px`,
//           height: `${1117 * scale}px`,
//         }}
//       >
//         {/* Scaled wrapper */}
//         <div
//           className="relative origin-top-left"
//           style={{
//             width: '1728px',
//             height: '1117px',
//             transform: `scale(${scale})`,
//           }}
//         >
//           {/* Original Dashboard Design */}
//           <Dashboard />

//           {/* Clickable overlay on Resume Builder button */}
//           <button
//             onClick={() => onNavigate('templates')}
//             className="absolute left-[40px] top-[183px] w-[255px] h-[34px] cursor-pointer z-10 hover:bg-black/5 hover:scale-105 rounded transition-all duration-150"
//             aria-label="Go to Resume Builder"
//           />

//           {/* Clickable overlay on Job Discovery button */}
//           <button
//             onClick={() => onNavigate('jobs')}
//             className="absolute left-[40px] top-[250px] w-[255px] h-[34px] cursor-pointer z-10 hover:bg-black/5 hover:scale-105 rounded transition-all duration-150"
//             aria-label="Go to Job Discovery"
//           />

//           {/* Clickable overlay on Home/Logo - top left */}
//           <button
//             onClick={() => onNavigate('home')}
//             className="absolute left-0 top-0 w-[339px] h-[95px] cursor-pointer z-10 hover:opacity-80 transition-opacity duration-150"
//             aria-label="Go to Home"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
