import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

interface TemplateSelectionProps {
  onNavigate: (page: 'home' | 'dashboard' | 'signin' | 'login' | 'resume1' | 'resume2' | 'resume3' | 'jobs' | 'templates') => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  atsReady: boolean;
  preview: string;
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Professional Classic',
    description: 'Clean and timeless design perfect for traditional industries',
    atsReady: true,
    preview: '#C8A2FF'
  },
  {
    id: '2',
    name: 'Modern Executive',
    description: 'Bold layout for senior positions and leadership roles',
    atsReady: true,
    preview: '#A8D5C2'
  },
  {
    id: '3',
    name: 'Creative Designer',
    description: 'Showcase your creativity with this unique template',
    atsReady: true,
    preview: '#FF7F7F'
  },
  {
    id: '4',
    name: 'Tech Minimal',
    description: 'Minimalist design ideal for tech and startup roles',
    atsReady: true,
    preview: '#C8A2FF'
  },
  {
    id: '5',
    name: 'Academic Scholar',
    description: 'Perfect for research and academic positions',
    atsReady: true,
    preview: '#A8D5C2'
  },
  {
    id: '6',
    name: 'Sales Professional',
    description: 'Results-focused layout for sales and business roles',
    atsReady: true,
    preview: '#FF7F7F'
  }
];

export default function TemplateSelection({ onNavigate }: TemplateSelectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleContinue = () => {
    if (selectedTemplate) {
      // Navigate to Resume Builder 1 with selected template
      onNavigate('resume1');
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, templateId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedTemplate(templateId);
    }
  };

  const handleContinueKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && selectedTemplate) {
      e.preventDefault();
      handleContinue();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-neutral-800 shadow-sm">
        <div className="max-w-[1728px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <motion.button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-neutral-800 bg-white hover:bg-neutral-100 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-['Poppins:Medium',sans-serif] text-lg">Back to Dashboard</span>
            </motion.button>

            {/* Continue Button */}
            <motion.button
              onClick={handleContinue}
              onKeyDown={handleContinueKeyDown}
              disabled={!selectedTemplate}
              tabIndex={0}
              aria-disabled={!selectedTemplate}
              className={`px-8 py-4 rounded-xl font-['Poppins:SemiBold',sans-serif] text-lg transition-all focus:outline-none focus:ring-4 focus:ring-neutral-400 focus:ring-offset-2 ${
                selectedTemplate
                  ? 'bg-neutral-800 text-white hover:bg-neutral-700 cursor-pointer'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
              whileHover={selectedTemplate ? { scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } : {}}
              whileTap={selectedTemplate ? { scale: 0.98 } : {}}
            >
              Continue to Editor
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-16 px-8">
        <div className="max-w-[1728px] mx-auto">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h1 className="font-['Poppins:Bold',sans-serif] text-5xl text-neutral-800 mb-4">
              Choose Your Resume Template
            </h1>
            <p className="font-['Poppins:Regular',sans-serif] text-xl text-neutral-600">
              Select a template to get started. All templates are ATS-ready and fully customizable.
            </p>
          </motion.div>

          {/* Template Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="relative"
                >
                  <motion.button
                    onClick={() => setSelectedTemplate(template.id)}
                    onKeyDown={(e) => handleKeyDown(e, template.id)}
                    onHoverStart={() => setIsHovering(template.id)}
                    onHoverEnd={() => setIsHovering(null)}
                    tabIndex={0}
                    role="radio"
                    aria-checked={selectedTemplate === template.id}
                    aria-label={`${template.name} - ${template.description}`}
                    className={`w-full h-full p-6 rounded-2xl border-2 transition-all text-left focus:outline-none focus:ring-4 focus:ring-neutral-400 focus:ring-offset-2 ${
                      selectedTemplate === template.id
                        ? 'border-neutral-800 bg-neutral-50 shadow-lg'
                        : 'border-neutral-300 bg-white hover:border-neutral-500'
                    }`}
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                      transition: { duration: 0.15 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Template Preview */}
                    <div 
                      className="w-full h-64 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: template.preview }}
                    >
                      <FileText className="w-24 h-24 text-white opacity-50" />
                      
                      {/* Selection Indicator */}
                      <AnimatePresence>
                        {selectedTemplate === template.id && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
                          >
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Template Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-['Poppins:SemiBold',sans-serif] text-xl text-neutral-800">
                          {template.name}
                        </h3>
                        {template.atsReady && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-['Poppins:Medium',sans-serif]">
                            ATS Ready
                          </span>
                        )}
                      </div>
                      <p className="font-['Poppins:Regular',sans-serif] text-sm text-neutral-600">
                        {template.description}
                      </p>
                    </div>

                    {/* Hover Effect Overlay */}
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isHovering === template.id ? 0.05 : 0
                      }}
                      className="absolute inset-0 bg-neutral-800 rounded-2xl pointer-events-none"
                    />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Helper Text */}
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-12 text-center"
            >
              <p className="font-['Poppins:Medium',sans-serif] text-lg text-neutral-600">
                ✓ Template selected. Click "Continue to Editor" to start building your resume.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
