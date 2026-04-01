package com.Root.ResumeBuilder.Controller;

import com.Root.ResumeBuilder.service.ResumePdfService;
import com.Root.ResumeBuilder.service.ResumeUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Root.ResumeBuilder.model.Resume;
import com.Root.ResumeBuilder.service.ResumeService;

import lombok.RequiredArgsConstructor;

import java.util.List;


@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService service;

    private final ResumePdfService pdfService;




    @PostMapping
    public Resume createOrUpdate(@RequestBody Resume resume) {
        return service.saveNewResumeVersion(resume);
    }

    @GetMapping("/{id}")
    public Resume get(@PathVariable Long id){
        return service.getResume(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.deleteResume(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id) {

        Resume resume = service.getResume(id);
        if (resume == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] pdf = pdfService.generateResumePdf(resume);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=resume_" + id + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }



    @GetMapping("/{id}/download-template")
    public ResponseEntity<byte[]> downloadWithTemplate(
            @PathVariable Long id,
            @RequestParam String template) {

        Resume resume = service.getResume(id);
        if (resume == null) {
            return ResponseEntity.notFound().build();
        }

        // ✅ STORE TEMPLATE NAME
        resume.setTemplateName(template);
        service.updateTemplate(id, template);   // IMPORTANT

        byte[] pdf = pdfService.generateTemplatePdf(resume, template);

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=resume_" + template + "_" + id + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }


    @GetMapping("/history/{email}")
    public ResponseEntity<List<Resume>> getResumeHistory(
            @PathVariable String email) {

        return ResponseEntity.ok(service.getResumeHistory(email));
    }

//    @GetMapping("/{id}/download-template")
//    public ResponseEntity<byte[]> downloadWithTemplate(
//            @PathVariable Long id,
//            @RequestParam String template) {
//
//        Resume resume = service.getResume(id);
//        byte[] pdf = pdfService.generateTemplatePdf(resume, template);
//        return ResponseEntity.ok().body(pdf);
//    }

    @GetMapping("/{id}/download-used-template")
    public ResponseEntity<byte[]> downloadUsingStoredTemplate(@PathVariable Long id) {

        Resume resume = service.getResume(id);
        if (resume == null) {
            return ResponseEntity.notFound().build();
        }

        String template = resume.getTemplateName();

        byte[] pdf = (template == null || template.equals("basic"))
                ? pdfService.generateResumePdf(resume)
                : pdfService.generateTemplatePdf(resume, template);

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=resume_" + template + "_" + id + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }


}
