package com.Root.ResumeBuilder.service;

import com.Root.ResumeBuilder.Repository.ResumeRepository;
import com.Root.ResumeBuilder.model.Resume;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeUploadService {

    private final ResumeRepository resumeRepository;

    public ResumeUploadService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    /* ================= MAIN METHOD ================= */
    public Resume processAndSave(MultipartFile file) {
        String text;
        try {
            if (file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
                text = extractFromPdf(file);
            } else if (file.getOriginalFilename().toLowerCase().endsWith(".docx")) {
                text = extractFromDocx(file);
            } else {
                throw new RuntimeException("Unsupported file type");
            }
        } catch (Exception e) {
            throw new RuntimeException("Resume parsing failed", e);
        }

        text = normalize(text);
        Resume resume = mapTextToResume(text);
        
        // Note: You might want to set default USEREMAIL or TARGETROLE here if available
        return resumeRepository.save(resume);
    }

    /* ================= EXTRACTION HELPERS ================= */
    private String extractFromPdf(MultipartFile file) throws Exception {
        PDDocument document = PDDocument.load(file.getInputStream());
        PDFTextStripper stripper = new PDFTextStripper();
        String text = stripper.getText(document);
        document.close();
        return text;
    }

    private String extractFromDocx(MultipartFile file) throws Exception {
        XWPFDocument doc = new XWPFDocument(file.getInputStream());
        StringBuilder sb = new StringBuilder();
        for (XWPFParagraph p : doc.getParagraphs()) {
            sb.append(p.getText()).append("\n");
        }
        doc.close();
        return sb.toString();
    }

    /* ================= ALIASES (Same as before) ================= */
    public static final String[] FULLNAME_ALIASES = {"FULL NAME", "FULL_NAME", "NAME", "CANDIDATE NAME"};
    public static final String[] EMAIL_ALIASES = {"EMAIL", "MAIL", "E-MAIL", "EMAIL ADDRESS"};
    public static final String[] PHONE_ALIASES = {"PHONE", "CONTACT", "MOBILE", "PHONE NUMBER"};
    public static final String[] PLACE_ALIASES = {"PLACE", "LOCATION", "CITY"};
    public static final String[] DATE_ALIASES = {"DATE", "DATED"};
    public static final String[] LINKEDIN_ALIASES = {"LINKEDIN", "LINKEDIN PROFILE"};
    public static final String[] GITHUB_ALIASES = {"GITHUB", "GITHUB PROFILE"};
    public static final String[] SUMMARY_ALIASES = {"SUMMARY", "PROFILE", "CAREER OBJECTIVE", "ABOUT ME"};
    public static final String[] SKILLS_ALIASES = {"SKILLS", "TECHNICAL SKILLS", "KEY SKILLS"};
    public static final String[] EDUCATION_ALIASES = {"EDUCATION", "ACADEMIC QUALIFICATION", "DEGREE"};
    public static final String[] PROJECT_TITLE_ALIASES = {"PROJECTS", "PROJECT TITLE", "ACADEMIC PROJECT"};
    public static final String[] PROJECT_DESC_ALIASES = {"PROJECT DESCRIPTION", "PROJECT DETAILS"};
    public static final String[] INTERNSHIP_ORG_ALIASES = {"ORGANIZATION NAME", "COMPANY NAME"};
    public static final String[] INTERNSHIP_DESC_ALIASES = {"INTERNSHIP", "TRAINING", "INDUSTRIAL EXPOSURE"};
    public static final String[] CERTIFICATION_ALIASES = {"CERTIFICATIONS", "ACHIEVEMENTS", "COURSES"};
    public static final String[] SOFT_SKILLS_ALIASES = {"SOFT SKILLS", "CORE STRENGTHS", "STRENGTHS"};
    public static final String[] EXPERIENCE_ALIASES = {"EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT HISTORY"};
    public static final String[] DECLARATION_ALIASES = {"DECLARATION"};

    /* ================= TEXT → ALL CAPS ENTITY ================= */
    private Resume mapTextToResume(String text) {
        Resume resume = new Resume();

        // BASIC INFO - Updated to ALL CAPS Setters
        resume.setFULL_NAME(extractName(text));
        resume.setEMAIL(extractEmail(text));
        resume.setPHONE(extractPhone(text));
        
        String placeLine = extractValueByAliases(text, PLACE_ALIASES);
        if (!placeLine.isBlank()) {
            if (placeLine.toLowerCase().contains("date")) {
                resume.setPLACE(placeLine.split("(?i)date")[0].trim());
            } else {
                resume.setPLACE(placeLine);
            }
        }
        
        resume.setDATE(extractValueByAliases(text, DATE_ALIASES));
        resume.setLOCATION(resume.getPLACE()); // Syncing Location with Place
        resume.setLINKEDIN(extractValueByAliases(text, LINKEDIN_ALIASES));
        resume.setGITHUB(extractValueByAliases(text, GITHUB_ALIASES));

        // SUMMARY & SECTIONS
        resume.setSUMMARY(extractSectionByAliases(text, SUMMARY_ALIASES));
        resume.setEDUCATION(extractSectionByAliases(text, EDUCATION_ALIASES));
        resume.setDECLARATION(extractSectionByAliases(text, DECLARATION_ALIASES));
        resume.setEXPERIENCE(extractSectionByAliases(text, EXPERIENCE_ALIASES));

        // SKILLS
        String skillsBlock = extractSectionByAliases(text, SKILLS_ALIASES);
        String formattedSkills = formatSkills(normalize(skillsBlock));
        if (formattedSkills.isBlank()) {
            formattedSkills = extractInlineSkills(text);
        }
        resume.setSKILLS(formattedSkills);

        // SOFT SKILLS
        String softSkills = extractSectionByAliases(text, SOFT_SKILLS_ALIASES);
        resume.setSOFT_SKILLS(formatSkills(softSkills));

        // PROJECTS
        resume.setPROJECT_TITLE(extractSectionByAliases(text, PROJECT_TITLE_ALIASES));
        resume.setPROJECT_DESCRIPTION(extractSectionByAliases(text, PROJECT_DESC_ALIASES));

        // INTERNSHIP
        resume.setINTERNSHIP_ORG(extractValueByAliases(text, INTERNSHIP_ORG_ALIASES));
        resume.setINTERNSHIP_DESC(extractSectionByAliases(text, INTERNSHIP_DESC_ALIASES));

        // CERTIFICATIONS
        resume.setCERTIFICATIONS(extractSectionByAliases(text, CERTIFICATION_ALIASES));

        return resume;
    }

    /* ================= LOGIC HELPERS ================= */

    private String normalize(String text) {
        return text.replace("\r", "\n").replaceAll("[ ]{2,}", " ").replaceAll("\n{2,}", "\n").trim();
    }

    private String formatSkills(String skillsText) {
        if (skillsText == null || skillsText.isBlank()) return "";
        return Arrays.stream(skillsText.split("\\n"))
                .map(String::trim)
                .map(s -> s.replaceAll("[•●▪\\.]", ""))
                .filter(s -> s.length() > 1)
                .distinct()
                .collect(Collectors.joining(", "));
    }

    private String extractName(String text) {
        return text.split("\\n")[0].trim();
    }

    private String extractEmail(String text) {
        Matcher m = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}").matcher(text);
        return m.find() ? m.group() : "";
    }

    private String extractPhone(String text) {
        Matcher m = Pattern.compile("(\\+91[-\\s]?)?[6-9]\\d{9}").matcher(text);
        return m.find() ? m.group() : "";
    }

    private String extractSectionByAliases(String text, String[] aliases) {
        String upper = text.toUpperCase();
        for (String alias : aliases) {
            int start = upper.indexOf(alias.toUpperCase());
            if (start == -1) continue;
            int contentStart = start + alias.length();
            Pattern stopPattern = Pattern.compile(
                "\n\\s*(SUMMARY|SKILLS|SOFT SKILLS|EDUCATION|PROJECTS|INTERNSHIP|CERTIFICATIONS|EXPERIENCE|DECLARATION|PLACE|DATE)\\s*[:\\-]?",
                Pattern.CASE_INSENSITIVE
            );
            Matcher matcher = stopPattern.matcher(text.substring(contentStart));
            int end = matcher.find() ? contentStart + matcher.start() : text.length();
            return text.substring(contentStart, end).trim();
        }
        return "";
    }

    private String extractValueByAliases(String text, String[] aliases) {
        for (String alias : aliases) {
            Pattern p = Pattern.compile(alias + "\\s*[:\\-]?\\s*(.+)", Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(text);
            if (m.find() && m.group(1) != null) {
                return m.group(1).split("\\|")[0].trim();
            }
        }
        return "";
    }

    private String extractInlineSkills(String text) {
        String lower = text.toLowerCase();
        Set<String> found = new LinkedHashSet<>();
        List<String> priority = List.of("spring boot", "rest api", "hibernate", "mysql", "java");
        for (String key : priority) { if (lower.contains(key)) found.add(key); }
        if (found.contains("spring boot")) found.remove("spring");
        return found.stream().map(s -> s.substring(0, 1).toUpperCase() + s.substring(1)).collect(Collectors.joining(", "));
    }
}