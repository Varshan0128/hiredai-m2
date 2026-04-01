import svgPaths from "../imports/svg-sx9wbgpgm0";
import imgImage27 from "figma:asset/4f615f69d2d9b205355cc0277bd0a950920436b9.png";
import imgImage39 from "figma:asset/3ec45d6c4ea256254887675485239d8fdaebdeda.png";
import imgImage38 from "figma:asset/5c9bbc745bd747cd7fc89357b603a9802b8a1eb7.png";
import imgImage37 from "figma:asset/27d24295ef56dcf7926b8f292d1fc4f6761946b9.png";

function BackArrow() {
  return (
    <div className="relative size-[50px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g>
          <path d={svgPaths.p3038400} stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </g>
      </svg>
    </div>
  );
}

interface ResumeCardProps {
  image: string;
  title: string;
  index: number;
}

function ResumeCard({ image, title, index }: ResumeCardProps) {
  return (
    <button
      className="relative bg-[#f6f6f4] rounded-[20px] w-full aspect-[379/502] overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-2 active:scale-[0.98] group"
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-8 transition-transform duration-300 group-hover:scale-105">
        <img alt={title} className="max-w-full max-h-full object-contain" src={image} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[45%] to-[#f6f6f4] to-[80%] transition-opacity duration-300 group-hover:opacity-90" />
      <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-all duration-300 group-hover:translate-y-[-4px]">
        <p className="font-['Poppins',sans-serif] font-medium text-[20px] text-[#262626] leading-normal">
          {title}
        </p>
      </div>
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </button>
  );
}

interface ResumeHistoryProps {
  onBackClick: () => void;
}

export default function ResumeHistory({ onBackClick }: ResumeHistoryProps) {
  const resumes = [
    { image: imgImage37, title: "Entry level resume template" },
    { image: imgImage38, title: "Entry level resume template" },
    { image: imgImage39, title: "Entry level resume template" },
  ];

  return (
    <div className="min-h-screen w-full bg-white px-4 py-6 md:px-8 md:py-10 lg:px-16 lg:py-12">
      {/* Back Arrow */}
      <button
        onClick={onBackClick}
        className="flex items-center justify-center size-[50px] -rotate-90 hover:opacity-70 transition-opacity"
      >
        <BackArrow />
      </button>

      {/* Title */}
      <h1 className="font-['Poppins',sans-serif] font-semibold text-[32px] text-[#262626] text-center mt-4 mb-8 md:mb-16">
        Resume history
      </h1>

      {/* Resume Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {resumes.map((resume, index) => (
            <ResumeCard key={index} image={resume.image} title={resume.title} index={index} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}