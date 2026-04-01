import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Save, Eye, Undo2, Redo2, Plus, GripVertical, Trash2, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import PageBackButton from './PageBackButton';

import { Page } from "../App";

interface ResumeEditorProps {
  onNavigate: (page: Page) => void;
}

interface ContentBlock {
  id: string;
  type: 'experience' | 'education' | 'skills' | 'certificates';
  title: string;
  content: string;
}

export default function ResumeEditor({ onNavigate }: ResumeEditorProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [atsScore, setAtsScore] = useState(85);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: '1', type: 'experience', title: 'Work Experience', content: 'Senior Frontend Developer at TechCorp' },
    { id: '2', type: 'education', title: 'Education', content: 'BS in Computer Science' },
    { id: '3', type: 'skills', title: 'Skills', content: 'React, TypeScript, Node.js' },
  ]);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@email.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');

  // Autosave simulation
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      toast.success('Resume saved successfully!');
    }, 800);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onNavigate('templates');
    }
  };

  const handleAddBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      content: 'New ' + type,
    };
    setContentBlocks([...contentBlocks, newBlock]);
    setHasUnsavedChanges(true);
    toast.success('Block added!');
  };

  const handleDeleteBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== id));
    setHasUnsavedChanges(true);
    toast.success('Block removed!');
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Desktop */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-neutral-800">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Left */}
            <PageBackButton onClick={handleBack} />

            {/* Center - Title & Status */}
            <div className="flex items-center gap-4">
              <h1 className="font-['Poppins:Bold',sans-serif] text-xl text-neutral-800">
                Resume Editor
              </h1>
              {isSaving ? (
                <span className="flex items-center gap-2 text-sm text-blue-600 font-['Poppins:Medium',sans-serif]">
                  <motion.div
                    className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Saving...
                </span>
              ) : hasUnsavedChanges ? (
                <span className="text-sm text-orange-600 font-['Poppins:Medium',sans-serif]">
                  Unsaved changes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-green-600 font-['Poppins:Medium',sans-serif]">
                  ✓ Saved
                </span>
              )}
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Poppins:Medium',sans-serif] ${
                  hasUnsavedChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={hasUnsavedChanges ? { scale: 1.03 } : {}}
                whileTap={hasUnsavedChanges ? { scale: 0.98 } : {}}
              >
                <Save size={18} />
                Save
              </motion.button>

              <motion.button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-white font-['Poppins:Medium',sans-serif]"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye size={18} />
                {isPreview ? 'Edit' : 'Preview'}
              </motion.button>

              <motion.button
                onClick={() => onNavigate('resume2')}
                className="px-6 py-2 rounded-lg bg-black text-white font-['Poppins:Bold',sans-serif]"
                whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-neutral-800">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <PageBackButton onClick={handleBack} label="Back" className="p-2" />
            <h1 className="font-['Poppins:Bold',sans-serif] text-lg">Editor</h1>
            <motion.button
              onClick={handlePreview}
              className="p-2"
              whileTap={{ scale: 0.95 }}
            >
              <Eye size={20} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 lg:pt-20">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
            {/* Editor Canvas - Left */}
            <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isPreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-[850px] mx-auto bg-white border-2 border-neutral-800 rounded-xl p-8 lg:p-12 shadow-xl"
                  >
                    <PreviewContent
                      name={name}
                      email={email}
                      phone={phone}
                      contentBlocks={contentBlocks}
                      atsScore={atsScore}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-[850px] mx-auto bg-white border-2 border-neutral-800 rounded-xl p-6 lg:p-12"
                  >
                    <EditableContent
                      name={name}
                      setName={setName}
                      email={email}
                      setEmail={setEmail}
                      phone={phone}
                      setPhone={setPhone}
                      contentBlocks={contentBlocks}
                      setContentBlocks={setContentBlocks}
                      onDelete={handleDeleteBlock}
                      onChange={() => setHasUnsavedChanges(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Controls - Right (Desktop) */}
            <aside className="hidden lg:block w-80 bg-white border-l-2 border-neutral-800 p-6 overflow-y-auto">
              <SidebarControls
                atsScore={atsScore}
                onAddBlock={handleAddBlock}
              />
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Toolbar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-neutral-800 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          <ToolbarButton icon={<Save size={20} />} label="Save" onClick={handleSave} />
          <ToolbarButton icon={<Eye size={20} />} label="Preview" onClick={handlePreview} />
          <ToolbarButton icon={<Undo2 size={20} />} label="Undo" />
          <ToolbarButton
            icon={<span className="text-xl">→</span>}
            label="Next"
            onClick={() => onNavigate('resume2')}
          />
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Your recent edits haven't been saved yet. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedDialog(false);
                onNavigate('templates');
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard & Exit
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                handleSave();
                setTimeout(() => {
                  onNavigate('templates');
                }, 1000);
              }}
              className="bg-black hover:bg-neutral-800"
            >
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Editable Content Component
function EditableContent({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  contentBlocks,
  setContentBlocks,
  onDelete,
  onChange,
}: any) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4 pb-6 border-b-2 border-neutral-200">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            onChange();
          }}
          className="w-full text-3xl lg:text-4xl font-['Poppins:Bold',sans-serif] text-neutral-800 border-2 border-transparent hover:border-neutral-300 focus:border-blue-500 rounded-lg px-3 py-2 outline-none transition-colors"
          placeholder="Your Name"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              onChange();
            }}
            className="flex-1 font-['Poppins:Regular',sans-serif] text-neutral-600 border-2 border-transparent hover:border-neutral-300 focus:border-blue-500 rounded-lg px-3 py-2 outline-none transition-colors"
            placeholder="Email"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              onChange();
            }}
            className="flex-1 font-['Poppins:Regular',sans-serif] text-neutral-600 border-2 border-transparent hover:border-neutral-300 focus:border-blue-500 rounded-lg px-3 py-2 outline-none transition-colors"
            placeholder="Phone"
          />
        </div>
      </div>

      {/* Content Blocks */}
      <div className="space-y-4">
        {contentBlocks.map((block: ContentBlock) => (
          <motion.div
            key={block.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="group relative p-4 border-2 border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors"
          >
            {/* Drag Handle */}
            <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 cursor-move">
              <GripVertical size={18} className="text-neutral-400" />
            </div>

            {/* Delete Button */}
            <motion.button
              onClick={() => onDelete(block.id)}
              className="absolute right-2 top-2 p-1 rounded bg-red-100 text-red-600 opacity-0 group-hover:opacity-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 size={16} />
            </motion.button>

            <input
              type="text"
              value={block.title}
              onChange={(e) => {
                const updated = contentBlocks.map((b: ContentBlock) =>
                  b.id === block.id ? { ...b, title: e.target.value } : b
                );
                setContentBlocks(updated);
                onChange();
              }}
              className="w-full text-xl font-['Poppins:Bold',sans-serif] text-neutral-800 border-none outline-none mb-2"
              placeholder="Block Title"
            />
            <textarea
              value={block.content}
              onChange={(e) => {
                const updated = contentBlocks.map((b: ContentBlock) =>
                  b.id === block.id ? { ...b, content: e.target.value } : b
                );
                setContentBlocks(updated);
                onChange();
              }}
              className="w-full font-['Poppins:Regular',sans-serif] text-neutral-700 border-none outline-none resize-none min-h-[60px]"
              placeholder="Content..."
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Preview Content Component
function PreviewContent({ name, email, phone, contentBlocks, atsScore }: any) {
  return (
    <div className="space-y-6">
      {/* ATS Score Badge */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
          <Award size={18} className="text-green-600" />
          <span className="font-['Poppins:Bold',sans-serif] text-green-800">
            ATS Score: {atsScore}%
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="pb-6 border-b-2 border-neutral-200">
        <h1 className="text-4xl font-['Poppins:Bold',sans-serif] text-neutral-800 mb-3">
          {name}
        </h1>
        <div className="flex flex-wrap gap-4 text-neutral-600 font-['Poppins:Regular',sans-serif]">
          <span>{email}</span>
          <span>•</span>
          <span>{phone}</span>
        </div>
      </div>

      {/* Content Blocks */}
      {contentBlocks.map((block: ContentBlock) => (
        <div key={block.id} className="space-y-2">
          <h2 className="text-xl font-['Poppins:Bold',sans-serif] text-neutral-800">
            {block.title}
          </h2>
          <p className="font-['Poppins:Regular',sans-serif] text-neutral-700 whitespace-pre-wrap">
            {block.content}
          </p>
        </div>
      ))}
    </div>
  );
}

// Sidebar Controls Component
function SidebarControls({ atsScore, onAddBlock }: any) {
  return (
    <div className="space-y-6">
      {/* ATS Score */}
      <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-['Poppins:Bold',sans-serif] text-neutral-800">ATS Score</h3>
          <span className="text-2xl font-['Poppins:Bold',sans-serif] text-green-600">
            {atsScore}%
          </span>
        </div>
        <div className="w-full h-3 bg-white rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-green-600"
            initial={{ width: 0 }}
            animate={{ width: `${atsScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-2 text-xs font-['Poppins:Regular',sans-serif] text-neutral-600">
          Your resume is well-optimized for ATS systems
        </p>
      </div>

      {/* Add Content Blocks */}
      <div>
        <h3 className="font-['Poppins:Bold',sans-serif] text-neutral-800 mb-3">
          Add Section
        </h3>
        <div className="space-y-2">
          <AddBlockButton label="Experience" onClick={() => onAddBlock('experience')} />
          <AddBlockButton label="Education" onClick={() => onAddBlock('education')} />
          <AddBlockButton label="Skills" onClick={() => onAddBlock('skills')} />
          <AddBlockButton label="Certificates" onClick={() => onAddBlock('certificates')} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-['Poppins:Bold',sans-serif] text-neutral-800 mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <motion.button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-neutral-300 hover:border-neutral-800 font-['Poppins:Medium',sans-serif] text-neutral-800 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Undo2 size={16} />
            Undo
          </motion.button>
          <motion.button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-neutral-300 hover:border-neutral-800 font-['Poppins:Medium',sans-serif] text-neutral-800 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Redo2 size={16} />
            Redo
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Add Block Button
function AddBlockButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-neutral-300 hover:border-neutral-800 hover:bg-gray-50 font-['Poppins:Medium',sans-serif] text-neutral-800 text-sm"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Plus size={16} />
      {label}
    </motion.button>
  );
}

// Toolbar Button (Mobile)
function ToolbarButton({ icon, label, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-gray-100"
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-neutral-800">{icon}</div>
      <span className="text-xs font-['Poppins:Medium',sans-serif] text-neutral-800 mt-1">
        {label}
      </span>
    </motion.button>
  );
}
