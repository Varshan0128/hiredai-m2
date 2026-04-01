package com.Root.ResumeBuilder.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("ID")
    private Long ID;

    @JsonProperty("USEREMAIL")
    private String USEREMAIL;

    @JsonProperty("TARGETROLE")
    private String TARGETROLE;

    @JsonProperty("VERSION")
    private Integer VERSION;

    @JsonProperty("ACTIVE")
    private Boolean ACTIVE;

    @JsonProperty("CREATEDAT")
    private LocalDateTime CREATEDAT;

    @JsonProperty("FULL_NAME")
    private String FULL_NAME;

    @JsonProperty("EMAIL")
    private String EMAIL;

    @JsonProperty("PHONE")
    private String PHONE;

    @JsonProperty("LOCATION")
    private String LOCATION;

    @JsonProperty("LINKEDIN")
    private String LINKEDIN;

    @JsonProperty("GITHUB")
    private String GITHUB;

    @JsonProperty("PROFESSIONAL_TITLE")
    private String PROFESSIONAL_TITLE;

    @JsonProperty("INSTITUTION_NAME")
    private String INSTITUTION_NAME;

    @JsonProperty("PROJECT_TITLE")
    private String PROJECT_TITLE;

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonProperty("PROJECT_DESCRIPTION")
    private String PROJECT_DESCRIPTION;

    @JsonProperty("INTERNSHIP_ORG")
    private String INTERNSHIP_ORG;

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonProperty("INTERNSHIP_DESC")
    private String INTERNSHIP_DESC;

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonProperty("SUMMARY")
    private String SUMMARY;

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonProperty("SKILLS")
    private String SKILLS;

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonProperty("EXPERIENCE")
    private String EXPERIENCE;

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonProperty("EDUCATION")
    private String EDUCATION;

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonProperty("PROJECTS")
    private String PROJECTS;

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonProperty("CERTIFICATIONS")
    private String CERTIFICATIONS;

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonProperty("SOFT_SKILLS")
    private String SOFT_SKILLS;

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonProperty("DECLARATION")
    private String DECLARATION;

    @JsonProperty("PLACE")
    private String PLACE;

    @JsonProperty("DATE")
    private String DATE;

    @JsonProperty("TEMPLATE_NAME")
    private String TEMPLATE_NAME;

    public String getTemplateName() {
        return TEMPLATE_NAME;
    }

    public void setTemplateName(String templateName) {
        this.TEMPLATE_NAME = templateName;
    }
}
