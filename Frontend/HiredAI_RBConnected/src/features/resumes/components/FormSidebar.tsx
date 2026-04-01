import { useEffect } from "react";
import {
  TEMPLATE_EDITOR_PLACEHOLDERS,
  sanitizeTemplateEditorFormData,
} from "./templateEditorDefaults";

/* -------------------------------------------------
   Multiline fields
--------------------------------------------------*/
const MULTILINE_FIELDS = [
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
];

const resumeData = JSON.parse(localStorage.getItem("resume_data_v1") || "{}");


const data = {
  // ───────── Personal Details ─────────
  fullName: resumeData?.personalDetails?.FULL_NAME || "",
  email: resumeData?.personalDetails?.EMAIL || "",
  phone: resumeData?.personalDetails?.PHONE || "",
  location: resumeData?.personalDetails?.LOCATION || "",
  linkedin: resumeData?.personalDetails?.LINKEDIN || "",
  professionalTitle: resumeData?.personalDetails?.PROFESSIONAL_TITLE || "",
  professionalProfile: resumeData?.personalDetails?.PROFESSIONAL_PROFILE || "",
  profile: resumeData?.personalDetails?.PROFILE || "",

  // ───────── Summary ─────────
  summary: resumeData?.summary?.SUMMARY || "",

  // ───────── Skills ─────────
  skills: resumeData?.skills?.SKILLS || "",
  technicalSkills: resumeData?.skills?.TECHNICAL_SKILLS || "",
  softSkills: resumeData?.skills?.SOFT_SKILLS || "",
  areasOfExpertise: resumeData?.skills?.AREAS_OF_EXPERTISE || "",

  // ───────── Education ─────────
  education: resumeData?.education?.EDUCATION || "",
  degreeName: resumeData?.education?.DEGREE_NAME || "",

  // ───────── Experience ─────────
  jobTitle: resumeData?.experience?.JOB_TITLE || "",
  companyName: resumeData?.experience?.COMPANY_NAME || "",
  organizationName: resumeData?.experience?.ORGANIZATION_NAME || "",
  internship: resumeData?.experience?.INTERNSHIP || "",
  experience: resumeData?.experience?.EXPERIENCE || "",
  experienceDescription: resumeData?.experience?.EXPERIENCE_DESCRIPTION || "",

  // ───────── Projects ─────────
  projectTitle: resumeData?.projects?.PROJECT_TITLE || "",
  projects: resumeData?.projects?.PROJECTS || "",
  academicProjects: resumeData?.projects?.ACADEMIC_PROJECTS || "",

  // ───────── Certifications ─────────
  certifications: resumeData?.certifications?.CERTIFICATIONS || "",
  certificationName: resumeData?.certifications?.CERTIFICATION_NAME || "",

  // ───────── Achievements ─────────
  achievements: resumeData?.achievements?.ACHIEVEMENTS || "",

  // ───────── Additional ─────────
  careerObjective: resumeData?.additional?.CAREER_OBJECTIVE || "",
  declaration: resumeData?.additional?.DECLARATION || "",
  strengths: resumeData?.additional?.STRENGTHS || "",
  date: resumeData?.additional?.DATE || "",
  place: resumeData?.additional?.PLACE || "",
};


const STORAGE_KEY = "resume_data_v1";

export default function FormSidebar({
  formData,
  setFormData,
  activeFields,
}: any) {
  /* -------------------------------------------------
     Load saved data on mount
  --------------------------------------------------*/
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.personalDetails) {
          setFormData(sanitizeTemplateEditorFormData(parsed.personalDetails));
        }
      }
    } catch (err) {
      console.error("Failed to load form data", err);
    }
  }, [setFormData]);

  /* -------------------------------------------------
     Save data on every change
  --------------------------------------------------*/
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...parsed,
          personalDetails: sanitizeTemplateEditorFormData(formData),
        }),
      );
    } catch (err) {
      console.error("Failed to save form data", err);
    }
  }, [formData]);

  /* -------------------------------------------------
     Render ONLY allowed fields
  --------------------------------------------------*/
  return (
    <div className="w-full lg:w-[926px] bg-white rounded-lg overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.1)] p-6">
      <h2 className="font-['Poppins:Medium',sans-serif] text-xl text-black mb-6">
        Personal Details
      </h2>

      {activeFields.map((field: string) => (
          <div className="mb-6" key={field}>
            <label className="block font-['Poppins:Medium',sans-serif] text-sm text-[#262626] mb-2">
              {field.replace(/_/g, " ")}
            </label>

            {MULTILINE_FIELDS.includes(field) ? (
              <textarea
                rows={3}
                value={formData[field] || ""}
                placeholder={TEMPLATE_EDITOR_PLACEHOLDERS[field] || ""}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
                className="w-full bg-[#f6f6f4] border border-[rgba(0,0,0,0.12)] rounded-lg px-4 py-3 font-['Poppins:Medium',sans-serif] text-base text-[#262626] focus:outline-none focus:border-black resize-none"
              />
            ) : (
              <input
                type={field === "EMAIL" ? "email" : "text"}
                value={formData[field] || ""}
                placeholder={TEMPLATE_EDITOR_PLACEHOLDERS[field] || ""}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
                className="w-full bg-[#f6f6f4] border border-[rgba(0,0,0,0.12)] rounded-lg px-4 py-3 font-['Poppins:Medium',sans-serif] text-base text-[#262626] focus:outline-none focus:border-black"
              />
            )}
          </div>
        ))}

      <p className="font-['Poppins:Medium',sans-serif] text-sm text-[rgba(65,65,65,0.7)]">
        These details are automatically saved and restored.
      </p>
    </div>
  );
}
