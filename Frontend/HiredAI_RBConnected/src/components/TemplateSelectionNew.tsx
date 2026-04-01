import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Page } from "../App";
import PageBackButton from './PageBackButton';

interface TemplateSelectionNewProps {
  onNavigate: (page: Page) => void;
}

interface Template {
  id: string;
  name: string;
  preview: string;
  badge: string;
  category: string;
  color: string;
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Modern Professional',
    preview: 'MP',
    badge: 'ATS-Ready',
    category: 'Professional',
    color: '#C8A2FF',
  },
  {
    id: '2',
    name: 'Clean Minimal',
    preview: 'CM',
    badge: 'ATS-Ready',
    category: 'Minimal',
    color: '#A8D5C2',
  },
  {
    id: '3',
    name: 'Creative Bold',
    preview: 'CB',
    badge: 'ATS-Ready',
    category: 'Creative',
    color: '#FF7F7F',
  },
  {
    id: '4',
    name: 'Executive Classic',
    preview: 'EC',
    badge: 'ATS-Ready',
    category: 'Professional',
    color: '#FFB84D',
  },
  {
    id: '5',
    name: 'Tech Modern',
    preview: 'TM',
    badge: 'ATS-Ready',
    category: 'Tech',
    color: '#6366F1',
  },
  {
    id: '6',
    name: 'Designer Portfolio',
    preview: 'DP',
    badge: 'ATS-Ready',
    category: 'Creative',
    color: '#EC4899',
  },
];

export default function TemplateSelectionNew({ onNavigate }: TemplateSelectionNewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleContinue = () => {
    if (!selectedTemplate) return;

    setIsTransitioning(true);
    // Animate selected card expansion then navigate
    setTimeout(() => {
      onNavigate('resume1');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Back Button */}
            <PageBackButton fallbackTo="/dashboard" />

            {/* Title */}
            <h1 className="font-['Poppins:Bold',sans-serif] text-xl lg:text-2xl text-neutral-800">
              Choose a Template
            </h1>

            {/* Continue Button */}
            <motion.button
              onClick={handleContinue}
              disabled={!selectedTemplate}
              className={`px-6 py-2 rounded-lg font-['Poppins:Bold',sans-serif] transition-all ${
                selectedTemplate
                  ? 'bg-black text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={selectedTemplate ? { scale: 1.03, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' } : {}}
              whileTap={selectedTemplate ? { scale: 0.98 } : {}}
              transition={{ duration: 0.15 }}
            >
              Continue
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Info Section */}
          <div className="py-8 text-center">
            <p className="font-['Poppins:Regular',sans-serif] text-neutral-600 max-w-2xl mx-auto">
              Select a professionally designed template optimized for ATS systems. Each template is recruiter-approved and ensures your resume gets noticed.
            </p>
          </div>

          {/* Template Grid - Masonry Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {templates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  isTransitioning={isTransitioning && selectedTemplate === template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile Swipe Hint */}
          <div className="sm:hidden mt-8 text-center">
            <p className="font-['Poppins:Regular',sans-serif] text-sm text-neutral-500">
              💡 Swipe to see more templates
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Template Card Component
function TemplateCard({
  template,
  isSelected,
  isTransitioning,
  onClick,
  index,
}: {
  template: Template;
  isSelected: boolean;
  isTransitioning: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative p-6 bg-white rounded-2xl text-left overflow-hidden group cursor-pointer ${
        isSelected
          ? 'border-4 border-black'
          : 'border-2 border-neutral-300 hover:border-neutral-800'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isTransitioning ? 1.1 : 1,
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={!isSelected ? {
        scale: 1.03,
        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
      } : {}}
      whileTap={{ scale: 0.98 }}
      aria-pressed={isSelected}
      role="radio"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-black rounded-full flex items-center justify-center"
          >
            <Check size={18} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Preview */}
      <div
        className="w-full aspect-[3/4] rounded-xl mb-4 flex items-center justify-center text-white text-6xl font-['Poppins:Bold',sans-serif] shadow-inner"
        style={{ backgroundColor: template.color }}
      >
        {template.preview}
      </div>

      {/* Template Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-['Poppins:Bold',sans-serif] text-base text-neutral-800 flex-1">
            {template.name}
          </h3>
          {template.badge && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-['Poppins:Medium',sans-serif] whitespace-nowrap">
              <Sparkles size={12} />
              {template.badge}
            </span>
          )}
        </div>
        <p className="font-['Poppins:Regular',sans-serif] text-sm text-neutral-600">
          {template.category}
        </p>
      </div>

      {/* Hover Overlay */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: isSelected ? 0 : 0.05 }}
        transition={{ duration: 0.15 }}
      />
    </motion.button>
  );
}
