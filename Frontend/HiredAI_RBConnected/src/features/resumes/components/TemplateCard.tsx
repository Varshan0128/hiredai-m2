import { useState } from "react";

interface TemplateCardProps {
  title?: string;
  html: string;
  isSelected?: boolean;
}

export function TemplateCard({ title = "Entry level resume template", html, isSelected = false }: TemplateCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`rounded-[20px] p-4 flex flex-col items-center transition-colors ${
        isSelected ? "bg-[#eef4ff] ring-2 ring-[#2563eb]" : "bg-[#f6f6f4]"
      }`}
    >

      {/* Fixed viewport */}
      <div
        className="relative bg-white shadow-md rounded-sm overflow-hidden"
        style={{
          width: "278px",
          height: "390px",
        }}
      >
        {/* Real A4 centered & scaled */}
        <div
          style={{
            width: "794px",
            height: "1123px",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%) scale(0.35)",
            transformOrigin: "center",
            background: "white",
            border: "2px solid #d1d5db",
            boxSizing: "border-box",
          }}
        >
          {!isLoaded ? (
            <div className="absolute inset-0 bg-[#f3f4f6]" />
          ) : null}

          <iframe
            srcDoc={html}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            className="w-full h-full border-none pointer-events-none bg-white transition-opacity duration-150"
            style={{ opacity: isLoaded ? 1 : 0 }}
            title={title}
          />
        </div>
      </div>

      <p className="mt-3 text-sm font-medium capitalize"> </p>
    </div>
  );
}
