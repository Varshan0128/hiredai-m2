import svgPaths from "../imports/svg-ib7m6km1lm";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: 'pdf' | 'doc' | 'image') => void;
}

export function DownloadModal({ isOpen, onClose, onDownload }: DownloadModalProps) {
  if (!isOpen) return null;

  const handleDownload = (format: 'pdf' | 'doc' | 'image') => {
    onDownload(format);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[20px] shadow-[0px_4px_40px_rgba(0,0,0,0.15)] w-full max-w-[480px] p-8 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
              <path 
                d="M18 6L6 18M6 6l12 12" 
                stroke="black" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </button>
          
          {/* Header */}
          <h2 className="font-['Poppins:Bold',sans-serif] text-[#262626] text-2xl sm:text-3xl mb-6">
            Download Resume
          </h2>
          
          <p className="font-['Poppins:Medium',sans-serif] text-[rgba(65,65,65,0.7)] text-base sm:text-lg mb-8">
            Choose your preferred format:
          </p>
          
          {/* Download options */}
          <div className="space-y-4">
            {/* PDF option */}
            <button
              onClick={() => handleDownload('pdf')}
              className="w-full bg-[#f6f6f4] hover:bg-[#e8e8e6] border-2 border-transparent hover:border-black rounded-[16px] px-6 py-5 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <path 
                      d="M7 18h10M7 14h10M7 10h4M9 22h6c1.886 0 2.828 0 3.414-.586C19 20.828 19 19.886 19 18V6c0-1.886 0-2.828-.586-3.414C17.828 2 16.886 2 15 2H9c-1.886 0-2.828 0-3.414.586C5 3.172 5 4.114 5 6v12c0 1.886 0 2.828.586 3.414C6.172 22 7.114 22 9 22z"
                      stroke="#262626" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-['Poppins:SemiBold',sans-serif] text-[#262626] text-lg">
                    PDF Document
                  </p>
                  <p className="font-['Poppins:Medium',sans-serif] text-[rgba(65,65,65,0.6)] text-sm">
                    Universal format, best for sharing
                  </p>
                </div>
              </div>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24">
                <path 
                  d="M9 18l6-6-6-6" 
                  stroke="#262626" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </button>
            
            {/* DOC option */}
            <button
              onClick={() => handleDownload('doc')}
              className="w-full bg-[#f6f6f4] hover:bg-[#e8e8e6] border-2 border-transparent hover:border-black rounded-[16px] px-6 py-5 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <path 
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" 
                      stroke="#262626" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                    <path 
                      d="M14 2v6h6M16 13H8M16 17H8M10 9H8" 
                      stroke="#262626" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-['Poppins:SemiBold',sans-serif] text-[#262626] text-lg">
                    Word Document
                  </p>
                  <p className="font-['Poppins:Medium',sans-serif] text-[rgba(65,65,65,0.6)] text-sm">
                    Editable format for further changes
                  </p>
                </div>
              </div>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24">
                <path 
                  d="M9 18l6-6-6-6" 
                  stroke="#262626" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </button>
            
            {/* Image option */}
            <button
              onClick={() => handleDownload('image')}
              className="w-full bg-[#f6f6f4] hover:bg-[#e8e8e6] border-2 border-transparent hover:border-black rounded-[16px] px-6 py-5 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <path 
                      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" 
                      stroke="#262626" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-['Poppins:SemiBold',sans-serif] text-[#262626] text-lg">
                    Image (PNG)
                  </p>
                  <p className="font-['Poppins:Medium',sans-serif] text-[rgba(65,65,65,0.6)] text-sm">
                    Perfect for social media & portfolios
                  </p>
                </div>
              </div>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24">
                <path 
                  d="M9 18l6-6-6-6" 
                  stroke="#262626" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
