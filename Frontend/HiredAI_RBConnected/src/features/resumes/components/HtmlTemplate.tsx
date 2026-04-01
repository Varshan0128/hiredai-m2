interface HtmlTemplateProps {
  template: string;
  data: Record<string, string>;
}

export const renderTemplateHtml = (template: string, data: Record<string, string>) => {
  const resolveTemplateValue = (rawKey: string): string => {
    const key = rawKey.trim();

    // Some templates use different summary keys; reuse available content consistently.
    const fallbackKeys: Record<string, string[]> = {
      PROFILE: ["PROFILE", "SUMMARY"],
      PROFESSIONAL_PROFILE: ["PROFESSIONAL_PROFILE", "SUMMARY", "PROFILE"],
      CAREER_OBJECTIVE: ["CAREER_OBJECTIVE", "SUMMARY", "PROFILE", "PROFESSIONAL_PROFILE"],
      TECHNICAL_SKILLS: ["TECHNICAL_SKILLS", "SKILLS"],
      SOFT_SKILLS: ["SOFT_SKILLS", "STRENGTHS", "SKILLS"],
      AREAS_OF_EXPERTISE: ["AREAS_OF_EXPERTISE", "TECHNICAL_SKILLS", "SKILLS"],
      ACADEMIC_PROJECTS: ["ACADEMIC_PROJECTS", "PROJECTS"],
      PROJECT_TITLE: ["PROJECT_TITLE", "PROJECTS"],
      CERTIFICATION_NAME: ["CERTIFICATION_NAME", "CERTIFICATIONS"],
      INTERNSHIP: ["INTERNSHIP", "EXPERIENCE_DESCRIPTION", "EXPERIENCE"],
      EXPERIENCE_DESCRIPTION: ["EXPERIENCE_DESCRIPTION", "EXPERIENCE", "INTERNSHIP"],
      JOB_DESCRIPTION: ["JOB_DESCRIPTION", "EXPERIENCE_DESCRIPTION", "EXPERIENCE", "INTERNSHIP"],
      STRENGTHS: ["STRENGTHS", "SOFT_SKILLS", "SKILLS"],
      ACHIEVEMENTS: ["ACHIEVEMENTS", "PROJECTS"],
    };

    const candidates = fallbackKeys[key] || [key];
    for (const candidate of candidates) {
      const value = data[candidate];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }

    return "";
  };

  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return resolveTemplateValue(key).replace(/\n/g, "<br/>");
  });
};

export default function HtmlTemplate({ template, data }: HtmlTemplateProps) {
  const html = renderTemplateHtml(template, data);

  return (
    <div className="w-full h-full overflow-auto bg-white">
      <div
        className="p-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
