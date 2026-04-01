import LogInPageImport from "../imports/LogInPage";
import { useEffect, useState } from "react";
import PageBackButton from "./PageBackButton";

interface LogInPageProps {
  onNavigate: (page: string) => void;
}

export default function LogInPage({ onNavigate }: LogInPageProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const designWidth = 1728;
      const designHeight = 1117;
      const scaleX = window.innerWidth / designWidth;
      const scaleY = window.innerHeight / designHeight;
      setScale(Math.min(scaleX, scaleY, 1));
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  return (
    <div className="w-screen h-screen bg-white overflow-hidden flex items-center justify-center">
      <PageBackButton variant="floating" fallbackTo="/" />
      <div
        className="relative flex-shrink-0"
        style={{
          width: `${1728 * scale}px`,
          height: `${1117 * scale}px`,
        }}
      >
        <div
          className="relative origin-top-left"
          style={{
            width: "1728px",
            height: "1117px",
            transform: `scale(${scale})`,
          }}
        >
          {/* ========================= */}
          {/* ✅ UI LAYER (TYPEABLE) */}
          {/* ========================= */}
          <div className="relative z-20 pointer-events-auto">
            <LogInPageImport onNavigate={onNavigate} />
          </div>

          {/* ========================= */}
          {/* ✅ OVERLAY LAYER */}
          {/* ========================= */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            {/* Logo */}
            <button
              onClick={() => onNavigate("home")}
              className="absolute left-[451px] top-[50px] w-[826px] h-[200px] pointer-events-auto"
              aria-label="Go to Home"
            />

            {/* Login */}
            <button
              onClick={() => onNavigate("home")}
              className="absolute left-[209px] top-[734px] w-[408px] h-[62px] rounded-[8px] pointer-events-auto"
              aria-label="Login"
            />

            {/* Sign up */}
            <button
              onClick={() => onNavigate("signin")}
              className="absolute left-[977px] top-[812px] w-[100px] h-[40px] pointer-events-auto"
              aria-label="Sign up"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
