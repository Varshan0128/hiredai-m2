import { useEffect, useMemo, useRef, useState } from "react";
import minimal from "../Resumes/1minimal.html?raw";
import minimal1 from "../Resumes/1minimal1.html?raw";
import minimal2 from "../Resumes/1minimal2.html?raw";
import minimal3 from "../Resumes/1minimal3.html?raw";
import modern from "../Resumes/1modern.html?raw";
import modern1 from "../Resumes/1modern1.html?raw";
import modern2 from "../Resumes/1modern2.html?raw";
import modern3 from "../Resumes/1modern3.html?raw";
import professional from "../Resumes/1professional.html?raw";
import professional1 from "../Resumes/1professional1.html?raw";
import professional2 from "../Resumes/1professional2.html?raw";
import professional3 from "../Resumes/1professional3.html?raw";
import { TemplateCard } from "./TemplateCard";
import { renderTemplateHtml } from "./HtmlTemplate";
import PageBackButton from "../../../components/PageBackButton";
import {
  EMPTY_TEMPLATE_EDITOR_FORM_DATA,
  TEMPLATE_EDITOR_PLACEHOLDERS,
  sanitizeTemplateEditorFormData,
} from "./templateEditorDefaults";
import type { TemplateEditorFormData } from "./TemplateEditor";
interface TemplateSelectionProps {
  selectedRole: string;
  selectedTemplate?: string;
  formData?: TemplateEditorFormData;
  onContinue?: (template: string) => void;
  onBack?: () => void;
}


const templates = [
  { id: "minimal", name: "Classic Minimal", html: minimal },
  { id: "minimal1", name: "Centered Minimal", html: minimal1 },
  { id: "minimal2", name: "Structured Minimal", html: minimal2 },
  { id: "minimal3", name: "Minimal Divider", html: minimal3 },
  { id: "modern", name: "Framed Modern", html: modern },
  { id: "modern1", name: "Double Border", html: modern1 },
  { id: "modern2", name: "Accent Modern", html: modern2 },
  { id: "modern3", name: "Boxed Modern", html: modern3 },
  { id: "professional", name: "Standard Professional", html: professional },
  { id: "professional1", name: "Executive One-Page", html: professional1 },
  { id: "professional2", name: "Two-Column Professional", html: professional2 },
  { id: "professional3", name: "Contemporary Professional", html: professional3 }
];


export function TemplateSelection({
  selectedRole,
  selectedTemplate,
  formData,
  onContinue,
  onBack,
}: TemplateSelectionProps) {
  const [pendingTemplate, setPendingTemplate] = useState(selectedTemplate || templates[0].id);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedTemplate) {
      setPendingTemplate(selectedTemplate);
    }
  }, [selectedTemplate]);

  const previewData = useMemo(() => {
    const sanitized = sanitizeTemplateEditorFormData(
      formData || (EMPTY_TEMPLATE_EDITOR_FORM_DATA as TemplateEditorFormData),
    ) as TemplateEditorFormData;

    return {
      ...TEMPLATE_EDITOR_PLACEHOLDERS,
      ...sanitized,
      PROFESSIONAL_TITLE: sanitized.PROFESSIONAL_TITLE || selectedRole,
      JOB_TITLE: sanitized.JOB_TITLE || selectedRole,
    };
  }, [formData, selectedRole]);

  const selectedTemplateConfig = templates.find((template) => template.id === pendingTemplate) || templates[0];
  const previewTemplateConfig = templates.find((template) => template.id === previewTemplate) || null;
  const previewHtml = previewTemplateConfig
    ? renderTemplateHtml(previewTemplateConfig.html, previewData).replace(
        "</head>",
        "<style>html,body{overflow:hidden !important; margin:0 !important;} *::-webkit-scrollbar{display:none;} *{scrollbar-width:none;}</style></head>",
      )
    : "";
  const scaledPreviewWidth = 794 * previewScale;
  const scaledPreviewHeight = 1123 * previewScale;

  const handleOpenPreview = (templateId: string) => {
    setPreviewTemplate(templateId);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };

  const handleSelectTemplate = () => {
    if (!previewTemplateConfig) return;
    setPendingTemplate(previewTemplateConfig.id);
    setPreviewTemplate(null);
    onContinue?.(previewTemplateConfig.id);
  };

  useEffect(() => {
    if (!previewTemplateConfig || !previewViewportRef.current) return;

    const pageWidth = 794;
    const pageHeight = 1123;

    const updateScale = () => {
      const viewport = previewViewportRef.current;
      if (!viewport) return;

      const widthScale = (viewport.clientWidth - 48) / pageWidth;
      setPreviewScale(Math.max(0.55, Math.min(widthScale, 1)));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(previewViewportRef.current);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [previewTemplateConfig]);

  return (
    <div className="min-h-screen bg-white px-4 py-8 sm:px-8 lg:px-14 lg:py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 lg:mb-12">
        <PageBackButton onClick={onBack} fallbackTo="/jobrole" />
        
        <h1 className="font-['Poppins:Bold',sans-serif] text-[#262626] text-2xl sm:text-3xl lg:text-4xl">
          Choose a template
        </h1>
        
        {/* Job role display - showing selected role */}
        <div className="ml-auto hidden lg:block">
          <div className="bg-[#f6f6f4] border border-[rgba(0,0,0,0.25)] rounded-lg px-6 py-3 min-w-[320px]">
            <div className="flex items-center justify-between">
              <p className="font-['Poppins:Medium',sans-serif] text-[#262626] text-lg">
                {selectedRole}
              </p>
              <button 
                onClick={onBack}
                 className="ml-4 text-[rgba(38,38,38,0.5)] hover:text-[#262626] transition-colors text-sm whitespace-nowrap"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile job role display */}
      <div className="lg:hidden mb-6">
        <div className="bg-[#f6f6f4] border border-[rgba(0,0,0,0.25)] rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="font-['Poppins:Medium',sans-serif] text-[#262626] text-base">
              Job role: {selectedRole}
            </p>
            <button 
              onClick={onBack}
              className="text-[rgba(38,38,38,0.5)] hover:text-[#262626] transition-colors text-sm"
            >
              Change
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-semibold text-[#262626]">Templates</p>
          <p className="text-sm text-black">
            Click a template to open its preview. Choose it from the popup if it fits.
          </p>
        </div>
        <div className="flex items-center">
          <div className="rounded-full bg-[#eff6ff] px-4 py-2 text-sm font-medium text-black">
            Current: <span>{selectedTemplateConfig.name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 pb-32 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
        {templates.map((template) => {
          const isSelected = pendingTemplate === template.id;
          return (
            <button
              key={template.id}
              onClick={() => handleOpenPreview(template.id)}
              className="text-left transition-transform hover:scale-[1.01]"
              aria-pressed={isSelected}
            >
              <TemplateCard
                html={renderTemplateHtml(template.html, previewData)}
                title={template.name}
                isSelected={isSelected}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-center text-sm font-medium text-black">
                  {template.name}
                </p>
                {isSelected ? (
                  <span className="rounded-full bg-[#e5e7eb] px-3 py-1 text-xs font-semibold text-black">
                    Selected
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {previewTemplateConfig ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="flex h-full max-h-[94vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] px-5 py-4 sm:px-6">
              <div>
                <p className="text-xl font-semibold text-[#111827]">{previewTemplateConfig.name}</p>
                <p className="text-sm text-black">
                  Review this template with your current resume content.
                </p>
              </div>
              <button
                onClick={handleClosePreview}
                className="rounded-full border border-[#d1d5db] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f3f4f6]"
              >
                Close
              </button>
            </div>

            <div ref={previewViewportRef} className="flex-1 overflow-hidden bg-[#e5e7eb] p-4 sm:p-6">
              <div className="flex h-full items-start justify-center overflow-auto">
                <div
                  className="relative shadow-[0_25px_60px_rgba(15,23,42,0.15)]"
                  style={{
                    width: scaledPreviewWidth,
                    height: scaledPreviewHeight,
                  }}
                >
                  <div
                    className="absolute left-0 top-0 origin-top-left overflow-hidden bg-white"
                    style={{
                      width: 794,
                      height: 1123,
                      transform: `scale(${previewScale})`,
                    }}
                  >
                    <iframe
                      srcDoc={previewHtml}
                      title={`${previewTemplateConfig.name} preview`}
                      className="h-full w-full border-0 bg-white"
                      scrolling="no"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e7eb] px-5 py-4 sm:px-6">
              <p className="text-sm text-black">
                {pendingTemplate === previewTemplateConfig.id
                  ? "This template is currently selected."
                  : "Use this template if you like this preview, or close and try another one."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClosePreview}
                  className="rounded-full border border-[#d1d5db] px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9fafb]"
                >
                  Try another
                </button>
                <button
                  onClick={handleSelectTemplate}
                  className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-black transition hover:bg-black"
                >
                  Use this template
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-[360px] rounded-[24px] border border-[#d1d5db] bg-white px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black">Selected template</p>
              <p className="text-lg font-semibold text-black">{selectedTemplateConfig.name}</p>
            </div>
            <button
              onClick={() => onContinue?.(pendingTemplate)}
              className="inline-flex items-center justify-center rounded-full border border-[#111827] bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f3f4f6]"
            >
              Continue to Editor
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
