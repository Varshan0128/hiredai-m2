package com.Root.ResumeBuilder.Repository;

import com.Root.ResumeBuilder.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    // Methods match Uppercase fields exactly
    List<Resume> findByUSEREMAILAndTARGETROLEOrderByVERSIONDesc(String USEREMAIL, String TARGETROLE);
    List<Resume> findByUSEREMAILOrderByCREATEDATDesc(String USEREMAIL);
}