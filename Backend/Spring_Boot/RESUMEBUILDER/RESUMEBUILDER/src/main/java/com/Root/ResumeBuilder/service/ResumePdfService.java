package com.Root.ResumeBuilder.service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import com.lowagie.text.DocumentException;
import com.lowagie.text.PageSize;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Entities;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.Root.ResumeBuilder.model.Resume;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

@Service
public class ResumePdfService {

    // ================= BASIC PDF =================
    public byte[] generateResumePdf(Resume resume) {

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        com.lowagie.text.Document pdf = new com.lowagie.text.Document(PageSize.A4);

        try {
            PdfWriter.getInstance(pdf, out);
            pdf.open();

            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD);
            Font headingFont = new Font(Font.HELVETICA, 14, Font.BOLD);
            Font bodyFont = new Font(Font.HELVETICA, 12);

            // ===== BASIC INFO (UPDATED GETTERS) =====
            pdf.add(new Paragraph(safe(resume.getFULL_NAME()), titleFont));
            pdf.add(new Paragraph(
                    safe(resume.getEMAIL()) + " | " +
                            safe(resume.getPHONE()) + " | " +
                            safe(resume.getLOCATION()),
                    bodyFont
            ));

            if (resume.getLINKEDIN() != null)
                pdf.add(new Paragraph("LinkedIn: " + resume.getLINKEDIN(), bodyFont));

            if (resume.getGITHUB() != null)
                pdf.add(new Paragraph("GitHub: " + resume.getGITHUB(), bodyFont));

            pdf.add(new Paragraph(" "));

            // ===== SUMMARY =====
            pdf.add(new Paragraph("Summary", headingFont));
            if (resume.getSUMMARY() != null)
                pdf.add(new Paragraph(resume.getSUMMARY(), bodyFont));
            pdf.add(new Paragraph(" "));

            // ===== SKILLS =====
            pdf.add(new Paragraph("Skills", headingFont));
            if (resume.getSKILLS() != null) {
                for (String skill : parseSkills(resume.getSKILLS())) {
                    pdf.add(new Paragraph("• " + skill, bodyFont));
                }
            }
            pdf.add(new Paragraph(" "));

            // ===== SOFT SKILLS =====
            pdf.add(new Paragraph("Soft Skills", headingFont));
            if (resume.getSOFT_SKILLS() != null)
                pdf.add(new Paragraph(resume.getSOFT_SKILLS(), bodyFont));
            pdf.add(new Paragraph(" "));

            // ===== EDUCATION =====
            pdf.add(new Paragraph("Education", headingFont));
            if (resume.getINSTITUTION_NAME() != null)
                pdf.add(new Paragraph(resume.getINSTITUTION_NAME(), bodyFont));
            if (resume.getEDUCATION() != null)
                pdf.add(new Paragraph(resume.getEDUCATION(), bodyFont));
            pdf.add(new Paragraph(" "));

            // ===== PROJECTS =====
            if (resume.getPROJECT_TITLE() != null) {
                pdf.add(new Paragraph("Projects", headingFont));
                pdf.add(new Paragraph(resume.getPROJECT_TITLE(), bodyFont));
                if (resume.getPROJECT_DESCRIPTION() != null)
                    pdf.add(new Paragraph(resume.getPROJECT_DESCRIPTION(), bodyFont));
                pdf.add(new Paragraph(" "));
            }

            // ===== INTERNSHIP / TRAINING =====
            if (resume.getINTERNSHIP_ORG() != null) {
                pdf.add(new Paragraph("Internship / Training", headingFont));
                pdf.add(new Paragraph(resume.getINTERNSHIP_ORG(), bodyFont));
                if (resume.getINTERNSHIP_DESC() != null)
                    pdf.add(new Paragraph(resume.getINTERNSHIP_DESC(), bodyFont));
                pdf.add(new Paragraph(" "));
            }

            // ===== CERTIFICATIONS =====
            pdf.add(new Paragraph("Certifications", headingFont));
            if (resume.getCERTIFICATIONS() != null)
                pdf.add(new Paragraph(resume.getCERTIFICATIONS(), bodyFont));
            pdf.add(new Paragraph(" "));

            // ===== EXPERIENCE =====
            pdf.add(new Paragraph("Experience", headingFont));
            if (resume.getEXPERIENCE() != null)
                pdf.add(new Paragraph(resume.getEXPERIENCE(), bodyFont));
            pdf.add(new Paragraph(" "));

            // ===== DECLARATION =====
            pdf.add(new Paragraph("Declaration", headingFont));
            if (resume.getDECLARATION() != null)
                pdf.add(new Paragraph(resume.getDECLARATION(), bodyFont));
            pdf.add(new Paragraph(" "));

            // ===== PLACE & DATE =====
            if (resume.getPLACE() != null || resume.getDATE() != null) {
                pdf.add(new Paragraph(
                        "Place: " + safe(resume.getPLACE()) + "    Date: " + safe(resume.getDATE()),
                        bodyFont
                ));
            }

            pdf.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    // ================= TEMPLATE PDF =================
    public byte[] generateTemplatePdf(Resume resume, String templateName) {

        try {
            ClassPathResource resource =
                    new ClassPathResource("templates/" + templateName + ".html");

            String html;
            try (InputStream is = resource.getInputStream()) {
                html = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }

            /* ================= BASIC INFO ================= */
            html = replacePlaceholders(html, List.of("{{FULL_NAME}}", "{{NAME}}","{{YOUR_NAME}}","{{Your Name}}"), safe(resume.getFULL_NAME()));
            html = replacePlaceholders(html, List.of("{{EMAIL}}", "{{MAIL}}"), safe(resume.getEMAIL()));
            html = replacePlaceholders(html, List.of("{{PHONE}}", "{{CONTACT}}", "{{MOBILE}}"), safe(resume.getPHONE()));
            html = replacePlaceholders(html, List.of("{{LOCATION}}", "{{PLACE}}", "{{CITY}}"), safe(resume.getLOCATION()));
            html = replacePlaceholders(html, List.of("{{LINKEDIN}}", "{{LINKEDIN_PROFILE}}"), safe(resume.getLINKEDIN()));
            html = replacePlaceholders(html, List.of("{{GITHUB}}", "{{GITHUB_PROFILE}}"), safe(resume.getGITHUB()));

            /* ================= SUMMARY / PROFILE ================= */
            html = replacePlaceholders(html, List.of(
                    "{{SUMMARY}}", "{{PROFILE}}", "{{PROFESSIONAL_TITLE}}", "{{CAREER_OBJECTIVE}}"
            ), safe(resume.getSUMMARY()));

            /* ================= SKILLS ================= */
            html = replacePlaceholders(html, List.of("{{SKILLS}}", "{{TECHNICAL_SKILLS}}", "{{SOFT_SKILLS}}"), buildSkillsList(parseSkills(resume.getSKILLS())));

            /* ================= EDUCATION ================= */
            html = replacePlaceholders(html, List.of("{{EDUCATION}}", "{{DEGREE_NAME}}"), safe(resume.getEDUCATION()));

            /* ================= PROJECTS ================= */
            html = replacePlaceholders(html, List.of("{{PROJECT_TITLE}}", "{{PROJECTS}}", "{{ACADEMIC_PROJECTS}}"), safe(resume.getPROJECT_TITLE()));
            html = replacePlaceholders(html, List.of("{{PROJECT_DESCRIPTION}}"), safe(resume.getPROJECT_DESCRIPTION()));

            /* ================= INTERNSHIP ================= */
            html = replacePlaceholders(html, List.of("{{INTERNSHIP}}", "{{INTERNSHIP_ORG}}"), safe(resume.getINTERNSHIP_ORG()));
            html = replacePlaceholders(html, List.of("{{INTERNSHIP_DESC}}"), safe(resume.getINTERNSHIP_DESC()));

            /* ================= CERTIFICATIONS ================= */
            html = replacePlaceholders(html, List.of("{{CERTIFICATIONS}}", "{{CERTIFICATION_NAME}}"), safe(resume.getCERTIFICATIONS()));

            /* ================= EXPERIENCE ================= */
            html = replacePlaceholders(html, List.of("{{EXPERIENCE}}"), safe(resume.getEXPERIENCE()));
            html = replacePlaceholders(html, List.of("{{PROFESSIONAL_TITLE}}"), safe(resume.getPROFESSIONAL_TITLE()));

            /* ================= FOOTER ================= */
            html = replacePlaceholders(html, List.of("{{DECLARATION}}"), safe(resume.getDECLARATION()));
            html = replacePlaceholders(html, List.of("{{DATE}}"), safe(resume.getDATE()));
            html = replacePlaceholders(html, List.of("{{PLACE}}"), safe(resume.getPLACE()));

            // HTML ➜ XHTML
            Document doc = Jsoup.parse(html);
            doc.outputSettings()
                    .syntax(Document.OutputSettings.Syntax.xml)
                    .escapeMode(Entities.EscapeMode.xhtml)
                    .prettyPrint(true);

            String xhtml = doc.html();

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(xhtml, null);
            builder.toStream(output);
            builder.run();

            return output.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF template generation failed", e);
        }
    }

    // ================= HELPERS =================
    private List<String> parseSkills(String skills) {
        if (skills == null || skills.isBlank()) return List.of();
        return List.of(skills.split(",")).stream()
                .map(String::trim)
                .toList();
    }

    private String buildSkillsList(List<String> skills) {
        if (skills.isEmpty()) return "";
        return skills.stream()
                .map(s -> "<li>" + s + "</li>")
                .collect(java.util.stream.Collectors.joining());
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String replacePlaceholders(String html, List<String> keys, String value) {
        for (String key : keys) {
            html = html.replace(key, value);
        }
        return html;
    }
}