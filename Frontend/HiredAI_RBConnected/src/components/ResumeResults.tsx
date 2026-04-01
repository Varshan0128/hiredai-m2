import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Share2,
  Link as LinkIcon,
  Edit,
  FileText,
  Image as ImageIcon,
  FileType,
  Check,
  AlertCircle,
  Award,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

import { Page } from "../App";
import PageBackButton from './PageBackButton';

interface ResumeResultsProps {
  onNavigate: (page: Page) => void;
}

type DownloadFormat = 'pdf' | 'png' | 'docx';

const atsScore = 92;
const improvements = [
  { text: 'Add more action verbs to experience section', priority: 'high' },
  { text: 'Include specific metrics and achievements', priority: 'medium' },
  { text: 'Optimize keywords for target role', priority: 'low' },
];

const highlights = [
  'Strong ATS compatibility',
  'Well-structured sections',
  'Professional formatting',
  'Optimized keywords',
];

export default function ResumeResults({ onNavigate }: ResumeResultsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState(false);

  const handleDownload = async (format: DownloadFormat) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadError(false);

    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setDownloadProgress(i);
      }

      // Simulate successful download
      toast.success(`Resume downloaded as ${format.toUpperCase()}!`, {
        description: 'Your file is ready',
        action: {
          label: 'Open',
          onClick: () => toast.info('Opening file...'),
        },
      });

      setIsDownloading(false);
      setDownloadProgress(0);
    } catch (error) {
      setDownloadError(true);
      toast.error('Download failed', {
        description: 'Please try again',
        action: {
          label: 'Retry',
          onClick: () => handleDownload(format),
        },
      });
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleShare = () => {
    toast.success('Share link generated!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://hired-ai.com/resume/abc123');
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Back Button */}
            <PageBackButton fallbackTo="/dashboard" />

            {/* Title */}
            <h1 className="font-['Poppins:Bold',sans-serif] text-xl lg:text-2xl text-neutral-800">
              Resume Analysis
            </h1>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => onNavigate('resume1')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-neutral-800 font-['Poppins:Medium',sans-serif] text-neutral-800"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Edit size={18} />
                <span className="hidden sm:inline">Re-edit</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Summary & Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* ATS Score Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6 bg-white border-2 border-neutral-800 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <Award size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-['Poppins:Bold',sans-serif] text-neutral-800">
                      ATS Score
                    </h2>
                    <p className="text-sm text-neutral-600">Excellent!</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-5xl font-['Poppins:Bold',sans-serif] text-green-600 mb-2">
                    {atsScore}%
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 to-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${atsScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <p className="text-sm font-['Poppins:Regular',sans-serif] text-neutral-600">
                  Your resume is highly optimized for Applicant Tracking Systems
                </p>
              </motion.div>

              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="p-6 bg-white border-2 border-neutral-800 rounded-2xl"
              >
                <h3 className="font-['Poppins:Bold',sans-serif] text-neutral-800 mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-yellow-500" />
                  Highlights
                </h3>
                <ul className="space-y-3">
                  {highlights.map((highlight, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check size={16} className="text-green-600 mt-0.5 shrink-0" />
                      <span className="font-['Poppins:Regular',sans-serif] text-neutral-700">
                        {highlight}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Improvements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="p-6 bg-white border-2 border-neutral-800 rounded-2xl"
              >
                <h3 className="font-['Poppins:Bold',sans-serif] text-neutral-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" />
                  Suggested Improvements
                </h3>
                <ul className="space-y-3">
                  {improvements.map((improvement, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <AlertCircle
                        size={16}
                        className={`mt-0.5 shrink-0 ${
                          improvement.priority === 'high'
                            ? 'text-red-500'
                            : improvement.priority === 'medium'
                            ? 'text-orange-500'
                            : 'text-blue-500'
                        }`}
                      />
                      <span className="font-['Poppins:Regular',sans-serif] text-sm text-neutral-700">
                        {improvement.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Download Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="p-6 bg-white border-2 border-neutral-800 rounded-2xl"
              >
                <h3 className="font-['Poppins:Bold',sans-serif] text-neutral-800 mb-4">
                  Download & Share
                </h3>

                {/* Download Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg font-['Poppins:Bold',sans-serif] mb-3"
                      whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isDownloading}
                    >
                      <Download size={20} />
                      {isDownloading ? 'Downloading...' : 'Download Resume'}
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                      <FileText size={16} className="mr-2" />
                      <div className="flex-1">
                        <div className="font-['Poppins:Medium',sans-serif]">PDF</div>
                        <div className="text-xs text-neutral-500">
                          Best for printing (A4)
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('png')}>
                      <ImageIcon size={16} className="mr-2" />
                      <div className="flex-1">
                        <div className="font-['Poppins:Medium',sans-serif]">Image (PNG)</div>
                        <div className="text-xs text-neutral-500">
                          High quality, 2x scale
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('docx')}>
                      <FileType size={16} className="mr-2" />
                      <div className="flex-1">
                        <div className="font-['Poppins:Medium',sans-serif]">Word (DOCX)</div>
                        <div className="text-xs text-neutral-500">
                          Editable document
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Download Progress */}
                <AnimatePresence>
                  {isDownloading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-['Poppins:Medium',sans-serif] text-neutral-600">
                          Generating...
                        </span>
                        <span className="text-sm font-['Poppins:Bold',sans-serif] text-neutral-800">
                          {downloadProgress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-black"
                          style={{ width: `${downloadProgress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Share & Copy */}
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-neutral-800 rounded-lg font-['Poppins:Medium',sans-serif] text-neutral-800"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 size={18} />
                    Share
                  </motion.button>
                  <motion.button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-neutral-800 rounded-lg font-['Poppins:Medium',sans-serif] text-neutral-800"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LinkIcon size={18} />
                    Copy Link
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="sticky top-24"
              >
                <div className="bg-white border-2 border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Preview Header */}
                  <div className="px-6 py-4 bg-gray-50 border-b-2 border-neutral-800">
                    <h3 className="font-['Poppins:Bold',sans-serif] text-neutral-800">
                      Resume Preview
                    </h3>
                  </div>

                  {/* Preview Content */}
                  <div className="p-8 lg:p-12 bg-white">
                    <div className="max-w-[850px] mx-auto space-y-6">
                      {/* Name */}
                      <div>
                        <h1 className="text-4xl font-['Poppins:Bold',sans-serif] text-neutral-800 mb-3">
                          John Doe
                        </h1>
                        <div className="flex flex-wrap gap-4 text-neutral-600 font-['Poppins:Regular',sans-serif]">
                          <span>john.doe@email.com</span>
                          <span>•</span>
                          <span>+1 (555) 123-4567</span>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="pt-6 border-t-2 border-neutral-200">
                        <h2 className="text-xl font-['Poppins:Bold',sans-serif] text-neutral-800 mb-3">
                          Work Experience
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-['Poppins:Bold',sans-serif] text-neutral-800">
                              Senior Frontend Developer
                            </h3>
                            <p className="font-['Poppins:Medium',sans-serif] text-neutral-600">
                              TechCorp Inc. • 2020 - Present
                            </p>
                            <p className="mt-2 font-['Poppins:Regular',sans-serif] text-neutral-700">
                              Led development of React-based web applications serving 100k+ users.
                              Improved performance by 40% through optimization.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="pt-6 border-t-2 border-neutral-200">
                        <h2 className="text-xl font-['Poppins:Bold',sans-serif] text-neutral-800 mb-3">
                          Education
                        </h2>
                        <div>
                          <h3 className="font-['Poppins:Bold',sans-serif] text-neutral-800">
                            BS in Computer Science
                          </h3>
                          <p className="font-['Poppins:Medium',sans-serif] text-neutral-600">
                            University Name • 2016 - 2020
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="pt-6 border-t-2 border-neutral-200">
                        <h2 className="text-xl font-['Poppins:Bold',sans-serif] text-neutral-800 mb-3">
                          Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git'].map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-gray-100 text-neutral-800 rounded-full font-['Poppins:Medium',sans-serif] text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
