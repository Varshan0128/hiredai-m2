package com.Root.ResumeBuilder.service;

import com.Root.ResumeBuilder.Repository.ResumeRepository;
import com.Root.ResumeBuilder.model.Resume;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository repo;

    public Resume saveNewResumeVersion(Resume resume) {
        int nextVersion = repo
                .findByUSEREMAILAndTARGETROLEOrderByVERSIONDesc(
                        resume.getUSEREMAIL(),
                        resume.getTARGETROLE())
                .stream()
                .findFirst()
                .map(r -> r.getVERSION() + 1)
                .orElse(1);

        resume.setID(null);
        resume.setVERSION(nextVersion);
        resume.setCREATEDAT(LocalDateTime.now());
        resume.setACTIVE(true);

        return repo.save(resume);
    }

    public Resume getResume(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void deleteResume(Long id) {
        repo.deleteById(id);
    }

    public List<Resume> getResumeHistory(String email) {
        return repo.findByUSEREMAILOrderByCREATEDATDesc(email);
    }

    public void updateTemplate(Long id, String template) {
        Resume resume = repo.findById(id).orElse(null);
        if (resume == null) {
            return;
        }
        resume.setTEMPLATE_NAME(template);
        repo.save(resume);
    }
}
