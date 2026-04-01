export const templateFields: Record<string, string[]> = {
  minimal: ["FULL_NAME", "EMAIL", "PHONE", "SKILLS"],

  minimal1: ["FULL_NAME", "EMAIL", "PHONE", "SUMMARY", "SKILLS"],
  minimal2: ["FULL_NAME", "EMAIL", "LOCATION", "SKILLS"],
  minimal3: ["FULL_NAME", "SUMMARY", "EXPERIENCE"],

  modern: ["FULL_NAME", "SUMMARY", "SKILLS", "PROJECTS"],
  modern1: ["FULL_NAME", "SUMMARY", "EXPERIENCE", "PROJECTS"],
  modern2: ["FULL_NAME", "EXPERIENCE", "SKILLS", "CERTIFICATIONS"],
  modern3: ["FULL_NAME", "EMAIL", "LOCATION", "SKILLS"],

  professional: ["FULL_NAME", "EMAIL", "EXPERIENCE"],
  professional1: ["FULL_NAME", "SUMMARY", "EXPERIENCE", "SKILLS"],
  professional2: ["FULL_NAME", "EXPERIENCE", "PROJECTS"],
  professional3: ["FULL_NAME", "EMAIL", "CERTIFICATIONS"]
};
const activeFields = TEMPLATE_FIELDS[template] || TEMPLATE_FIELDS.minimal;
