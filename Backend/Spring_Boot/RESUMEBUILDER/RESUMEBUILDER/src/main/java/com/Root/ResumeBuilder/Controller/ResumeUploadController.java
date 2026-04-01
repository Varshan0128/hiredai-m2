package com.Root.ResumeBuilder.Controller;

import com.Root.ResumeBuilder.model.Resume;
import com.Root.ResumeBuilder.service.ResumeUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
public class ResumeUploadController {

    private final ResumeUploadService uploadService;

    public ResumeUploadController(ResumeUploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Resume> uploadResume(
            @RequestParam("file") MultipartFile file) {

        Resume savedResume = uploadService.processAndSave(file);
        return ResponseEntity.ok(savedResume);
    }
}
