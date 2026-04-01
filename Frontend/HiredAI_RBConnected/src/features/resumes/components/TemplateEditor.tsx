import { useState, type Dispatch, type SetStateAction } from "react";
import FormSidebar from "./FormSidebar";
import svgPaths from "../imports/svg-s6vekn30pj";
import minimal from "../Resumes/minimal.html?raw";
import minimal1 from "../Resumes/minimal1.html?raw";
import minimal2 from "../Resumes/minimal2.html?raw";
import minimal3 from "../Resumes/minimal3.html?raw";
import modern from "../Resumes/modern.html?raw";
import modern1 from "../Resumes/modern1.html?raw";
import modern2 from "../Resumes/modern2.html?raw";
import modern3 from "../Resumes/modern3.html?raw";
import professional from "../Resumes/professional.html?raw";
import professional1 from "../Resumes/professional1.html?raw";
import professional2 from "../Resumes/professional2.html?raw";
import professional3 from "../Resumes/professional3.html?raw";
import HtmlTemplate from "./HtmlTemplate";
import { useAuth } from "../../../auth/AuthContext";
import {
  EMPTY_TEMPLATE_EDITOR_FORM_DATA,
  sanitizeTemplateEditorFormData,
} from "./templateEditorDefaults";

const RESUME_BUILDER_API_BASE = (import.meta.env.VITE_RESUME_BUILDER_API_URL || "http://localhost:8090").replace(/\/$/, "");

const templatesMap: Record<string, string> = {
  minimal,
  minimal1,
  minimal2,
  minimal3,
  modern,
  modern1,
  modern2,
  modern3,
  professional,
  professional1,
  professional2,
  professional3,
};

export interface TemplateEditorFormData {
  FULL_NAME: string;
  EMAIL: string;
  PHONE: string;
  LOCATION: string;
  SUMMARY: string;
  SKILLS: string;
  LINKEDIN: string;
  PROFILE: string;
  INTERNSHIP: string;
  PROFESSIONAL_TITLE: string;
  PROFESSIONAL_PROFILE: string;
  AREAS_OF_EXPERTISE: string;
  JOB_TITLE: string;
  JOB_DESCRIPTION: string;
  COMPANY_NAME: string;
  DEGREE_NAME: string;
  PROJECT_TITLE: string;
  EXPERIENCE_DESCRIPTION: string;
  ORGANIZATION_NAME: string;
  CERTIFICATION_NAME: string;
  SOFT_SKILLS: string;
  DECLARATION: string;
  CAREER_OBJECTIVE: string;
  TECHNICAL_SKILLS: string;
  ACADEMIC_PROJECTS: string;
  ACHIEVEMENTS: string;
  EDUCATION: string;
  EXPERIENCE: string;
  PROJECTS: string;
  PLACE: string;
  DATE: string;
  CERTIFICATIONS: string;
  STRENGTHS: string;
}

export const createDefaultTemplateEditorFormData = (): TemplateEditorFormData =>
  ({ ...EMPTY_TEMPLATE_EDITOR_FORM_DATA }) as TemplateEditorFormData;

interface TemplateEditorProps {
  selectedTemplate: string;
  selectedRole?: string;
  formData: TemplateEditorFormData;
  setFormData: Dispatch<SetStateAction<TemplateEditorFormData>>;
  onContinue?: (payload: { resumeId?: number; resumeText: string }) => void;
  onBack?: () => void;
}

export function TemplateEditor({
  selectedTemplate,
  selectedRole,
  formData,
  setFormData,
  onContinue,
  onBack,
}: TemplateEditorProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const templateHtml = templatesMap[selectedTemplate] || minimal;
  const usedFields = Array.from(
    new Set(templateHtml.match(/{{(.*?)}}/g)?.map((x) => x.replace(/[{}]/g, "")) || []),
  );

  const ATS_TEXT_FIELDS = [
    "FULL_NAME",
    "EMAIL",
    "PHONE",
    "LOCATION",
    "LINKEDIN",
    "PROFESSIONAL_TITLE",
    "SUMMARY",
    "PROFILE",
    "PROFESSIONAL_PROFILE",
    "CAREER_OBJECTIVE",
    "EDUCATION",
    "DEGREE_NAME",
    "SKILLS",
    "TECHNICAL_SKILLS",
    "SOFT_SKILLS",
    "AREAS_OF_EXPERTISE",
    "EXPERIENCE",
    "JOB_TITLE",
    "COMPANY_NAME",
    "ORGANIZATION_NAME",
    "INTERNSHIP",
    "EXPERIENCE_DESCRIPTION",
    "JOB_DESCRIPTION",
    "PROJECTS",
    "PROJECT_TITLE",
    "ACADEMIC_PROJECTS",
    "CERTIFICATIONS",
    "CERTIFICATION_NAME",
    "ACHIEVEMENTS",
    "STRENGTHS",
    "DECLARATION",
  ] as const;

  const sanitizedFormData = sanitizeTemplateEditorFormData(formData) as TemplateEditorFormData;

  const buildResumeText = (): string =>
    ATS_TEXT_FIELDS
      .map((field) => [field, String(sanitizedFormData[field] || "")] as const)
      .filter(([, value]) => value.trim().length > 0)
      .map(([key, value]) => `${key}: ${value.trim()}`)
      .join("\n");

  const handleContinue = async () => {
    const effectiveEmail = (formData.EMAIL || user?.email || "user@example.com").trim();
    const effectiveFormData = sanitizeTemplateEditorFormData({
      ...formData,
      EMAIL: formData.EMAIL || effectiveEmail,
    }) as TemplateEditorFormData;

    const resumePayload = {
      USEREMAIL: effectiveEmail,
      TARGETROLE: selectedRole || "",
      TEMPLATE_NAME: selectedTemplate,
      FULL_NAME: effectiveFormData.FULL_NAME,
      EMAIL: effectiveFormData.EMAIL,
      PHONE: effectiveFormData.PHONE,
      LOCATION: effectiveFormData.LOCATION,
      LINKEDIN: effectiveFormData.LINKEDIN,
      PROFESSIONAL_TITLE: effectiveFormData.PROFESSIONAL_TITLE,
      INSTITUTION_NAME: effectiveFormData.DEGREE_NAME || "",
      PROJECT_TITLE: effectiveFormData.PROJECT_TITLE || "",
      PROJECT_DESCRIPTION: effectiveFormData.PROJECTS || "",
      INTERNSHIP_ORG: effectiveFormData.ORGANIZATION_NAME || effectiveFormData.COMPANY_NAME || "",
      INTERNSHIP_DESC: effectiveFormData.INTERNSHIP || effectiveFormData.EXPERIENCE_DESCRIPTION || "",
      SUMMARY: effectiveFormData.SUMMARY,
      SKILLS: effectiveFormData.SKILLS,
      EXPERIENCE: effectiveFormData.EXPERIENCE,
      EDUCATION: effectiveFormData.EDUCATION,
      PROJECTS: effectiveFormData.PROJECTS,
      CERTIFICATIONS: effectiveFormData.CERTIFICATIONS,
      SOFT_SKILLS: effectiveFormData.SOFT_SKILLS,
      DECLARATION: effectiveFormData.DECLARATION,
      PLACE: effectiveFormData.PLACE,
      DATE: effectiveFormData.DATE,
    };

    setIsSaving(true);
    try {
      const response = await fetch(`${RESUME_BUILDER_API_BASE}/api/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(resumePayload),
      });

      if (!response.ok) {
        throw new Error(`Save failed with status ${response.status}`);
      }

      const savedResume = await response.json().catch(() => null);
      const resumeId = Number(savedResume?.ID ?? savedResume?.id);

      onContinue?.({
        resumeId: Number.isFinite(resumeId) ? resumeId : undefined,
        resumeText: buildResumeText(),
      });
    } catch (error) {
      console.error("Failed to save resume before analysis:", error);
      alert("Could not save resume to backend. Continuing to analysis without PDF download ID.");
      onContinue?.({ resumeText: buildResumeText() });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative px-4 sm:px-6 lg:px-10 py-6 lg:py-12">
      <div className="max-w-[1728px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-4 mb-6">
          <FormSidebar
            formData={sanitizedFormData}
            setFormData={setFormData}
            activeFields={usedFields}
          />
          <div className="w-full lg:flex-1 flex justify-center overflow-auto">
            <div
              className="bg-white shadow-xl"
              style={{
                width: "794px",
                minHeight: "1123px",
                transform: "scale(0.95)",
                transformOrigin: "top center",
              }}
            >
              <HtmlTemplate template={templateHtml} data={sanitizedFormData} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8">
          <button
            onClick={onBack}
            className="min-w-[159px] rounded-lg border border-neutral-800 bg-white px-6 py-2.5 flex items-center justify-center gap-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-colors"
          >
            <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 22 22">
              <path
                d={svgPaths.p155100}
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span className="font-['Poppins:Medium',sans-serif] text-[20px] text-black leading-normal">
              Back
            </span>
          </button>

          <button
            onClick={handleContinue}
            disabled={isSaving}
            className="bg-black text-white rounded-lg px-0 py-2.5 flex items-center justify-center hover:bg-gray-800 transition-colors min-w-[179px]"
          >
            <div className="flex items-center justify-center pl-0 pr-[12.833px]">
              <span className="font-['Poppins:Medium',sans-serif] text-[20px] leading-normal mr-2">
                {isSaving ? "Saving..." : "Continue"}
              </span>
              <div className="rotate-180 w-[12.833px] h-[11px]">
                <svg className="block w-full h-full" fill="none" viewBox="0 0 14.8333 13">
                  <path
                    d={svgPaths.p13c60ae0}
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
