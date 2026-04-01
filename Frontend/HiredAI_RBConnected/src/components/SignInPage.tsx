import SignIn from "../imports/SignIn";
import { useEffect, useState } from "react";
import PageBackButton from "./PageBackButton";

interface SignInPageProps {
  onNavigate: (page: string) => void;
}

export default function SignInPage({ onNavigate }: SignInPageProps) {
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
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  return (
    <div className="w-screen h-screen bg-white overflow-hidden flex items-center justify-center">
      <PageBackButton variant="floating" fallbackTo="/" />
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
            width: "1728px",
            height: "1117px",
            transform: `scale(${scale})`,
          }}
        >
          {/* Original Figma Design - Now Interactive */}
          <div className="pointer-events-auto">
            <SignIn onNavigate={onNavigate} />
          </div>

          {/* Clickable overlays for navigation - Only keeping non-form areas if needed */}

          {/* Logo - clickable to go home (optional, keeping for now if it doesn't block inputs) */}
          <button
            onClick={() => onNavigate("home")}
            className="absolute left-[451px] top-[36px] w-[826px] h-[180px] cursor-pointer z-10 hover:opacity-80 transition-opacity duration-150 bg-transparent border-none"
            aria-label="Go to Home"
          />
        </div>
      </div>
    </div>
  );
}
