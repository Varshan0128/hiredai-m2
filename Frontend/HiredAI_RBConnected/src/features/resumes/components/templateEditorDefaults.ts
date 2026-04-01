export type TemplateEditorRecord = Record<string, string>;

export const EMPTY_TEMPLATE_EDITOR_FORM_DATA: TemplateEditorRecord = {
  FULL_NAME: "",
  EMAIL: "",
  PHONE: "",
  LOCATION: "",
  SUMMARY: "",
  SKILLS: "",
  LINKEDIN: "",
  PROFILE: "",
  INTERNSHIP: "",
  PROFESSIONAL_TITLE: "",
  PROFESSIONAL_PROFILE: "",
  AREAS_OF_EXPERTISE: "",
  JOB_TITLE: "",
  JOB_DESCRIPTION: "",
  COMPANY_NAME: "",
  DEGREE_NAME: "",
  PROJECT_TITLE: "",
  EXPERIENCE_DESCRIPTION: "",
  ORGANIZATION_NAME: "",
  CERTIFICATION_NAME: "",
  SOFT_SKILLS: "",
  DECLARATION: "",
  CAREER_OBJECTIVE: "",
  TECHNICAL_SKILLS: "",
  ACADEMIC_PROJECTS: "",
  ACHIEVEMENTS: "",
  EDUCATION: "",
  EXPERIENCE: "",
  PROJECTS: "",
  PLACE: "",
  DATE: "",
  CERTIFICATIONS: "",
  STRENGTHS: "",
};

const LEGACY_TEMPLATE_EDITOR_PREFILL: TemplateEditorRecord = {
  FULL_NAME: "YOUR NAME",
  EMAIL: "email@gmail.com",
  PHONE: "+91-xxxxxxxxxx",
  LOCATION: "India",
  SUMMARY:
    "Detail-oriented software engineering graduate with strong fundamentals in programming, object-oriented design, and problem-solving. Passionate about building efficient software applications and learning game development concepts through hands-on projects. ",
  SKILLS:
    "Programming Languages: C, C++, Java, C#  Game Development: Unity (Beginner), Game Mechanics, Basic UI Design Core Knowledge: Data Structures, Algorithms, OOP Concepts Tools & Platforms: Git, Visual Studio, Windows ",
  LINKEDIN: "linkedin.com/in/ankistsharma",
  PROFILE:
    "Motivated software engineer with strong foundations in programming, data structures, and application development. Experienced in building clean, maintainable solutions and eager to contribute to real-world software projects.",
  INTERNSHIP:
    "Software Development Intern ABC Technologies | Jan 2024 Ã¢â‚¬â€œ Apr 2024 Ã¢â‚¬Â¢ Assisted in coding, testing, and debugging application modules Ã¢â‚¬Â¢ Fixed logical issues and improved code quality Ã¢â‚¬Â¢ Worked with team members in an agile development environment ",
  PROFESSIONAL_TITLE: "Software Engineer",
  PROFESSIONAL_PROFILE:
    "Computer science graduate with strong fundamentals in software development, object-oriented programming, and problem-solving. Motivated to build clean, efficient applications and continuously enhance technical skills through hands-on projects and industry exposure. ",
  AREAS_OF_EXPERTISE:
    "Ã¢â‚¬Â¢ Core Java and Object-Oriented Programming Ã¢â‚¬Â¢ Data Structures and Algorithms Ã¢â‚¬Â¢ HTML, CSS, and basic JavaScript Ã¢â‚¬Â¢ Version Control using Git Ã¢â‚¬Â¢ Problem Solving and Debugging ",
  JOB_TITLE: "Software Development",
  JOB_DESCRIPTION:
    "Assisted in coding, testing, and debugging software modules while collaborating with the development team on feature delivery.",
  COMPANY_NAME: "ABC Technologies",
  DEGREE_NAME:
    "Bachelor of Engineering in Computer Science Ã¢â‚¬â€œ XYZ Engineering College, India (2020 Ã¢â‚¬â€œ 2024) ",
  PROJECT_TITLE: "2D Game Development Project",
  EXPERIENCE_DESCRIPTION:
    "Software Development Intern ABC Technologies | Jan 2024 Ã¢â‚¬â€œ Apr 2024 Ã¢â‚¬Â¢ Assisted in coding, testing, and debugging application modules Ã¢â‚¬Â¢ Fixed logical issues and improved code quality Ã¢â‚¬Â¢ Worked with team members in an agile development environment ",
  ORGANIZATION_NAME: "ABC Technologies",
  CERTIFICATION_NAME:
    "Ã¢â‚¬Â¢ Introduction to Game Development Ã¢â‚¬â€œ Online Certification Ã¢â‚¬Â¢ Data Structures and Algorithms Ã¢â‚¬â€œ Technical Training Program ",
  SOFT_SKILLS:
    "Problem Solving, Team Collaboration, Time Management, Communication Skills, Adaptability ",
  DECLARATION:
    "I hereby declare that the information provided above is true and correct to the best of my knowledge and belief.",
  CAREER_OBJECTIVE:
    "To obtain an entry-level position as a software engineer where I can apply my programming knowledge, problem-solving skills, and passion for learning to contribute effectively to organizational goals. ",
  TECHNICAL_SKILLS:
    "Programming Languages: C, C++, Java, C# Core Concepts: Data Structures, Algorithms, Object-Oriented Programming Game Development Basics: Unity, Game Logic, Player Mechanics Tools: Git, Visual Studio, Windows OS ",
  ACADEMIC_PROJECTS:
    "AI Resume Builder Ã¢â‚¬â€œ Developed a dynamic resume generator using HTML templates to produce professional resumes automatically. Water Cleaning Robot Ã¢â‚¬â€œ Designed a prototype system to collect floating waste from water bodies using automated mechanisms. ",
  ACHIEVEMENTS:
    "Ã¢â‚¬Â¢ Successfully completed multiple academic software projects Ã¢â‚¬Â¢ Consistently maintained good academic performance Ã¢â‚¬Â¢ Actively participated in technical workshops and coding activities ",
  EDUCATION:
    "Bachelor of Engineering in Computer Science XYZ Engineering College, India 2020 Ã¢â‚¬â€œ 2024 ",
  EXPERIENCE:
    "Software Development Intern ABC Technologies | Jan 2024 Ã¢â‚¬â€œ Apr 2024 Ã¢â‚¬Â¢ Assisted in coding, testing, and debugging software modules Ã¢â‚¬Â¢ Improved application performance by fixing logic issues Ã¢â‚¬Â¢ Worked closely with senior developers in an agile environment ",
  PROJECTS:
    "2D Game Development Project Ã¢â‚¬Â¢ Developed a simple 2D game using Unity and C# Ã¢â‚¬Â¢ Implemented player controls, scoring system, and collision logic  Library Management System Ã¢â‚¬Â¢ Created a Java-based console application Ã¢â‚¬Â¢ Implemented add, update, delete, and search functionalities ",
  PLACE: "India",
  DATE: "08 February 2026",
  CERTIFICATIONS:
    "Ã¢â‚¬Â¢ Introduction to Game Development Ã¢â‚¬â€œ Online Certification Ã¢â‚¬Â¢ Data Structures and Algorithms Ã¢â‚¬â€œ Technical Training Program ",
  STRENGTHS: "Problem-solving Quick learner ,Team collaboration, Strong logical thinking ",
};

export const TEMPLATE_EDITOR_PLACEHOLDERS: TemplateEditorRecord = {
  FULL_NAME: "Ankit Sharma",
  EMAIL: "ankit.sharma@example.com",
  PHONE: "+91 98765 43210",
  LOCATION: "Chennai, India",
  SUMMARY:
    "Detail-oriented software engineering graduate with strong fundamentals in programming, object-oriented design, and problem-solving.",
  SKILLS:
    "Programming Languages: C, C++, Java, C#\nGame Development: Unity, game mechanics, basic UI design\nCore Knowledge: Data structures, algorithms, OOP\nTools: Git, Visual Studio, Windows",
  LINKEDIN: "linkedin.com/in/ankitsharma",
  PROFILE:
    "Motivated software engineer with strong foundations in programming, data structures, and application development.",
  INTERNSHIP:
    "Software Development Intern - XYZ Technologies (Jan 2024 - Apr 2024)\nAssisted in coding, testing, and debugging application modules.",
  PROFESSIONAL_TITLE: "Software Engineer",
  PROFESSIONAL_PROFILE:
    "Computer science graduate with strong fundamentals in software development, object-oriented programming, and problem-solving.",
  AREAS_OF_EXPERTISE:
    "Core Java and object-oriented programming\nData structures and algorithms\nHTML, CSS, and basic JavaScript\nVersion control using Git\nProblem solving and debugging",
  JOB_TITLE: "Software Development Intern",
  JOB_DESCRIPTION:
    "Assisted in coding, testing, and debugging software modules while collaborating with the development team on feature delivery.",
  COMPANY_NAME: "XYZ Technologies",
  DEGREE_NAME:
    "Bachelor of Engineering in Computer Science - XYZ Engineering College, India (2020 - 2024)",
  PROJECT_TITLE: "2D Game Development Project",
  EXPERIENCE_DESCRIPTION:
    "Software Development Intern - XYZ Technologies (Jan 2024 - Apr 2024)\nAssisted in coding, testing, and debugging application modules\nFixed logical issues and improved code quality\nWorked with team members in an agile development environment",
  ORGANIZATION_NAME: "XYZ Technologies",
  CERTIFICATION_NAME:
    "Introduction to Game Development - Online Certification\nData Structures and Algorithms - Technical Training Program",
  SOFT_SKILLS:
    "Problem solving, team collaboration, time management, communication, adaptability",
  DECLARATION:
    "I hereby declare that the information provided above is true and correct to the best of my knowledge and belief.",
  CAREER_OBJECTIVE:
    "To obtain an entry-level software engineering role where I can apply my programming knowledge and problem-solving skills.",
  TECHNICAL_SKILLS:
    "Programming Languages: C, C++, Java, C#\nCore Concepts: Data structures, algorithms, object-oriented programming\nGame Development Basics: Unity, game logic, player mechanics\nTools: Git, Visual Studio, Windows",
  ACADEMIC_PROJECTS:
    "AI Resume Builder - Developed a dynamic resume generator using HTML templates.\nWater Cleaning Robot - Designed a prototype to collect floating waste from water bodies.",
  ACHIEVEMENTS:
    "Completed multiple academic software projects\nMaintained strong academic performance\nParticipated in technical workshops and coding activities",
  EDUCATION:
    "Bachelor of Engineering in Computer Science, XYZ Engineering College, India (2020 - 2024)",
  EXPERIENCE:
    "Software Development Intern - XYZ Technologies (Jan 2024 - Apr 2024)\nAssisted in coding, testing, and debugging software modules\nImproved application performance by fixing logic issues\nWorked closely with senior developers in an agile environment",
  PROJECTS:
    "2D Game Development Project - Developed a simple 2D game using Unity and C#\nLibrary Management System - Created a Java console application with add, update, delete, and search features",
  PLACE: "Chennai",
  DATE: "11 March 2026",
  CERTIFICATIONS:
    "Introduction to Game Development - Online Certification\nData Structures and Algorithms - Technical Training Program",
  STRENGTHS: "Problem-solving, quick learning, team collaboration, strong logical thinking",
};

const MOJIBAKE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“|Ã¢â‚¬â€œ|â€“/g, " - "],
  [/ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢|Ã¢â‚¬Â¢|â€¢/g, "\n- "],
  [/ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢|Ã¢â‚¬â„¢|â€™/g, "'"],
  [/ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ|Ã¢â‚¬Å“|â€œ/g, '"'],
  [/ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â|Ã¢â‚¬Â|â€/g, '"'],
  [/ÃƒÂ¢Ã¢â€šÂ¬|Ã¢â‚¬/g, " "],
];

const normalizeForComparison = (value: string) => value.replace(/\s+/g, " ").trim();

export const normalizeTemplateFieldText = (value: string): string => {
  let normalized = value || "";
  for (const [pattern, replacement] of MOJIBAKE_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
};

const isLegacyPrefilledFormData = (data: TemplateEditorRecord): boolean => {
  const meaningfulKeys = Object.keys(LEGACY_TEMPLATE_EDITOR_PREFILL).filter(
    (key) => normalizeForComparison(LEGACY_TEMPLATE_EDITOR_PREFILL[key]).length >= 12,
  );

  let matchCount = 0;
  for (const key of meaningfulKeys) {
    if (
      normalizeForComparison(data[key] || "") ===
      normalizeForComparison(normalizeTemplateFieldText(LEGACY_TEMPLATE_EDITOR_PREFILL[key]))
    ) {
      matchCount += 1;
    }
  }

  return matchCount >= 5;
};

export const sanitizeTemplateEditorFormData = (
  value?: Partial<TemplateEditorRecord> | null,
): TemplateEditorRecord => {
  const sanitized: TemplateEditorRecord = { ...EMPTY_TEMPLATE_EDITOR_FORM_DATA };

  for (const key of Object.keys(EMPTY_TEMPLATE_EDITOR_FORM_DATA)) {
    sanitized[key] = normalizeTemplateFieldText(String(value?.[key] || ""));
  }

  if (isLegacyPrefilledFormData(sanitized)) {
    return { ...EMPTY_TEMPLATE_EDITOR_FORM_DATA };
  }

  return sanitized;
};
