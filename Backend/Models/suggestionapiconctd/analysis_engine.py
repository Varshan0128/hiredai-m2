from __future__ import annotations

from collections import Counter
from math import sqrt
from typing import Dict, Iterable, List, Optional, Set, Tuple
import re

from job_services import (
    dedupe_jobs,
    enrich_jobs_with_details,
    fetch_job_details,
    fetch_scrapingdog_jobs,
    fetch_serpapi_jobs,
    fetch_serper_jobs,
    make_job_id,
    normalize_text,
)


SKILL_PATTERNS: Dict[str, Tuple[str, ...]] = {
    "React": ("react",),
    "Next.js": ("next.js", "nextjs"),
    "JavaScript": ("javascript", "js"),
    "TypeScript": ("typescript", "ts"),
    "HTML": ("html", "html5"),
    "CSS": ("css", "css3"),
    "Tailwind CSS": ("tailwind", "tailwind css"),
    "Redux": ("redux",),
    "Vue.js": ("vue", "vue.js"),
    "Angular": ("angular",),
    "Node.js": ("node", "node.js", "nodejs"),
    "Express.js": ("express", "express.js"),
    "Python": ("python",),
    "FastAPI": ("fastapi",),
    "Flask": ("flask",),
    "Django": ("django",),
    "Java": ("java",),
    "Spring": ("spring",),
    "Spring Boot": ("spring boot",),
    "C": (" c ", " c,", " c.", " c/", "(c)"),
    "C++": ("c++",),
    "C#": ("c#",),
    "SQL": ("sql",),
    "MySQL": ("mysql",),
    "PostgreSQL": ("postgresql", "postgres"),
    "MongoDB": ("mongodb", "mongo db"),
    "REST APIs": ("rest api", "restful api", "apis"),
    "GraphQL": ("graphql",),
    "Git": ("git",),
    "Docker": ("docker",),
    "Kubernetes": ("kubernetes", "k8s"),
    "AWS": ("aws", "amazon web services"),
    "Azure": ("azure",),
    "GCP": ("gcp", "google cloud"),
    "Pandas": ("pandas",),
    "NumPy": ("numpy",),
    "Power BI": ("power bi", "powerbi"),
    "Tableau": ("tableau",),
    "Excel": ("excel",),
    "Machine Learning": ("machine learning", "ml"),
    "Data Analysis": ("data analysis", "data analytics"),
    "Statistics": ("statistics", "statistical analysis"),
    "Figma": ("figma",),
    "Wireframing": ("wireframing", "wireframe"),
    "Prototyping": ("prototyping", "prototype"),
    "UX Research": ("ux research", "user research"),
    "Design Systems": ("design systems", "design system"),
    "SEO": ("seo", "search engine optimization"),
    "SEM": ("sem", "search engine marketing"),
    "Google Analytics": ("google analytics", "ga4"),
    "CRM": ("crm",),
    "Content Strategy": ("content strategy", "content marketing"),
    "Social Media Marketing": ("social media", "social media marketing"),
    "Email Marketing": ("email marketing",),
    "Stakeholder Management": ("stakeholder management",),
    "Project Management": ("project management",),
    "Process Improvement": ("process improvement",),
    "Reporting": ("reporting",),
    "Data Entry": ("data entry",),
    "Typing": ("typing",),
    "Communication": ("communication", "communicator"),
    "Leadership": ("leadership", "team lead"),
    "Problem Solving": ("problem solving", "problem-solving"),
    "Teamwork": ("teamwork", "collaboration"),
}

ROLE_PROFILES: List[Dict[str, object]] = [
    {
        "key": "frontend",
        "title": "Frontend Developer",
        "domain": "software",
        "skills": {"React", "Next.js", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS", "Redux", "Git"},
        "keywords": ("frontend", "web developer", "ui developer", "react developer"),
        "risk_pct": 46,
        "risk_label": "Medium",
    },
    {
        "key": "backend",
        "title": "Backend Developer",
        "domain": "software",
        "skills": {"Python", "FastAPI", "Flask", "Django", "Java", "Spring", "Spring Boot", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Docker", "REST APIs"},
        "keywords": ("backend", "api developer", "server-side", "microservices"),
        "risk_pct": 39,
        "risk_label": "Medium",
    },
    {
        "key": "fullstack",
        "title": "Full Stack Developer",
        "domain": "software",
        "skills": {"React", "JavaScript", "TypeScript", "Node.js", "Express.js", "Python", "SQL", "Docker", "Git", "REST APIs"},
        "keywords": ("full stack", "fullstack", "software engineer"),
        "risk_pct": 42,
        "risk_label": "Medium",
    },
    {
        "key": "data_analyst",
        "title": "Data Analyst",
        "domain": "data",
        "skills": {"Python", "SQL", "Excel", "Power BI", "Tableau", "Pandas", "Statistics", "Data Analysis"},
        "keywords": ("data analyst", "analytics", "business intelligence", "reporting analyst"),
        "risk_pct": 44,
        "risk_label": "Medium",
    },
    {
        "key": "ui_ux",
        "title": "UI/UX Designer",
        "domain": "design",
        "skills": {"Figma", "Wireframing", "Prototyping", "UX Research", "Design Systems", "Communication"},
        "keywords": ("ui", "ux", "product designer", "visual designer"),
        "risk_pct": 28,
        "risk_label": "Low",
    },
    {
        "key": "digital_marketing",
        "title": "Digital Marketing Specialist",
        "domain": "marketing",
        "skills": {"SEO", "SEM", "Google Analytics", "CRM", "Content Strategy", "Social Media Marketing", "Email Marketing"},
        "keywords": ("marketing", "seo", "content", "campaign"),
        "risk_pct": 58,
        "risk_label": "High",
    },
    {
        "key": "operations",
        "title": "Operations Analyst",
        "domain": "business",
        "skills": {"Excel", "Reporting", "Stakeholder Management", "Process Improvement", "Communication", "Project Management"},
        "keywords": ("operations", "analyst", "business operations", "process"),
        "risk_pct": 41,
        "risk_label": "Medium",
    },
    {
        "key": "data_entry",
        "title": "Data Entry Specialist",
        "domain": "business",
        "skills": {"Data Entry", "Typing", "Excel", "Reporting"},
        "keywords": ("data entry", "back office", "typing"),
        "risk_pct": 82,
        "risk_label": "High",
    },
]

EDUCATION_PATTERNS = [
    ("Doctorate", re.compile(r"\b(ph\.?d|doctorate|doctoral)\b", re.IGNORECASE)),
    ("Master's", re.compile(r"\b(m\.?tech|m\.?e\b|mca|mba|msc|m\.sc|master(?:'s)?|postgraduate)\b", re.IGNORECASE)),
    ("Bachelor's", re.compile(r"\b(b\.?tech|b\.?e\b|bca|bsc|b\.sc|bcom|b\.com|bachelor(?:'s)?|undergraduate)\b", re.IGNORECASE)),
    ("Diploma", re.compile(r"\b(diploma|polytechnic|associate degree)\b", re.IGNORECASE)),
]

EXPERIENCE_YEAR_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|year)\b", re.IGNORECASE)
DATE_RANGE_PATTERN = re.compile(r"\b(20\d{2}|19\d{2})\b")
TOKEN_PATTERN = re.compile(r"[a-z0-9][a-z0-9+#./-]{1,}", re.IGNORECASE)


def _contains_keyword(text: str, keyword: str) -> bool:
    if keyword == " c ":
        return " c " in f" {text} "
    pattern = rf"(?<![a-z0-9]){re.escape(keyword.lower())}(?![a-z0-9])"
    return bool(re.search(pattern, text))


def extract_skills_from_resume(resume_text: str) -> List[str]:
    normalized = normalize_text(resume_text).lower()
    found: List[str] = []

    for skill, variants in SKILL_PATTERNS.items():
        if any(_contains_keyword(normalized, variant.lower()) for variant in variants):
            found.append(skill)

    return sorted(found)


def extract_education_level(resume_text: str) -> str:
    for label, pattern in EDUCATION_PATTERNS:
        if pattern.search(resume_text):
            return label
    return ""


def extract_experience_years(resume_text: str) -> float:
    matches = [float(match.group(1)) for match in EXPERIENCE_YEAR_PATTERN.finditer(resume_text)]
    if matches:
        return max(matches)

    years = sorted({int(value) for value in DATE_RANGE_PATTERN.findall(resume_text)})
    if len(years) >= 2:
        span = years[-1] - years[0]
        if 0 < span <= 40:
            return float(span)

    return 0.0


def _tokenize(text: str) -> List[str]:
    return [token.lower() for token in TOKEN_PATTERN.findall(normalize_text(text))]


def _cosine_similarity(left_tokens: Iterable[str], right_tokens: Iterable[str]) -> float:
    left_counts = Counter(left_tokens)
    right_counts = Counter(right_tokens)
    if not left_counts or not right_counts:
        return 0.0

    common = set(left_counts) & set(right_counts)
    numerator = sum(left_counts[token] * right_counts[token] for token in common)
    left_norm = sqrt(sum(value * value for value in left_counts.values()))
    right_norm = sqrt(sum(value * value for value in right_counts.values()))
    if not left_norm or not right_norm:
        return 0.0
    return numerator / (left_norm * right_norm)


def _profile_similarity(profile: Dict[str, object], resume_text: str, skills: List[str]) -> float:
    profile_skills = [str(skill).lower() for skill in profile["skills"]]
    profile_keywords = [str(keyword).lower() for keyword in profile["keywords"]]
    evidence_tokens = _tokenize(" ".join(skills) or resume_text)
    profile_tokens = _tokenize(" ".join(profile_skills + profile_keywords + [str(profile["title"])]))
    similarity = _cosine_similarity(evidence_tokens, profile_tokens)

    overlap = len({skill.lower() for skill in skills} & set(profile_skills))
    keyword_hits = sum(1 for keyword in profile_keywords if keyword in resume_text.lower())
    return similarity + overlap * 0.08 + keyword_hits * 0.04


def infer_target_role(resume_text: str, skills: List[str]) -> Dict[str, object]:
    ranked = sorted(
        ROLE_PROFILES,
        key=lambda profile: _profile_similarity(profile, resume_text, skills),
        reverse=True,
    )
    return ranked[0]


def _score_resume(skills: List[str], experience_years: float, education_level: str) -> int:
    skill_score = min(len(skills) * 5, 50)
    experience_score = min(int(round(experience_years * 7)), 35)
    education_score = {
        "Doctorate": 15,
        "Master's": 13,
        "Bachelor's": 10,
        "Diploma": 7,
        "": 0,
    }.get(education_level, 0)
    return max(0, min(skill_score + experience_score + education_score, 100))


def _skill_gaps(skills: List[str], profile: Dict[str, object]) -> List[str]:
    current = {skill.lower() for skill in skills}
    missing = [
        skill
        for skill in sorted(profile["skills"])
        if str(skill).lower() not in current
    ]
    return missing[:6]


def _risk_for_profile(profile: Dict[str, object], skills: List[str]) -> Dict[str, object]:
    resilience_skills = {
        "Communication",
        "Leadership",
        "Problem Solving",
        "UX Research",
        "Design Systems",
        "Project Management",
        "Stakeholder Management",
    }
    reduction = sum(1 for skill in skills if skill in resilience_skills) * 2
    risk_pct = max(10, min(int(profile["risk_pct"]) - reduction, 95))
    risk_label = "Low" if risk_pct <= 30 else "Medium" if risk_pct <= 55 else "High"
    explanation = (
        f"{profile['title']} aligns with a {risk_label.lower()} automation-risk profile based on the detected role and resume skills."
    )
    return {
        "score": risk_pct,
        "label": risk_label,
        "role": profile["title"],
        "explanation": explanation,
    }


def _job_similarity(resume_text: str, skills: List[str], job: Dict[str, object]) -> Tuple[int, List[str]]:
    resume_skill_set = {skill.lower() for skill in skills}
    job_text = " ".join(
        [
            normalize_text(job.get("title")),
            normalize_text(job.get("description")),
            normalize_text(job.get("company")),
            " ".join(normalize_text(item) for item in job.get("requirements", []) if item),
        ]
    )
    job_skills = extract_skills_from_resume(job_text)
    job_skill_set = {skill.lower() for skill in job_skills}
    overlap = sorted(
        skill for skill in job_skills if skill.lower() in resume_skill_set
    )

    skill_similarity = (
        len(set(overlap)) / len(job_skill_set)
        if job_skill_set
        else 0.0
    )
    text_similarity = _cosine_similarity(_tokenize(resume_text), _tokenize(job_text))
    title_similarity = _cosine_similarity(_tokenize(" ".join(skills)), _tokenize(normalize_text(job.get("title"))))
    final_score = int(round((skill_similarity * 0.65 + text_similarity * 0.25 + title_similarity * 0.10) * 100))
    return final_score, overlap


def _normalize_job(job: Dict[str, object], similarity_score: int, overlap_skills: List[str]) -> Dict[str, object]:
    title = normalize_text(job.get("title")) or "Untitled role"
    company = normalize_text(job.get("company"))
    location = normalize_text(job.get("location")) or "Not specified"
    description = normalize_text(job.get("description"))
    role_profile = infer_target_role(f"{title} {description}", extract_skills_from_resume(f"{title} {description}"))
    risk = _risk_for_profile(role_profile, extract_skills_from_resume(f"{title} {description}"))
    reason = (
        f"Matched on {', '.join(overlap_skills[:4])}."
        if overlap_skills
        else "Relevant based on similarity with your resume content."
    )

    return {
        "id": make_job_id(title, company or "company", location),
        "title": title,
        "company": company or None,
        "location": location,
        "type": normalize_text(job.get("type")) or "Not specified",
        "salary": normalize_text(job.get("salary")) or "Not specified",
        "posted": normalize_text(job.get("posted")) or "Recently",
        "description": description,
        "requirements": extract_skills_from_resume(description),
        "link": normalize_text(job.get("apply_link")),
        "apply_link": normalize_text(job.get("apply_link")),
        "source": normalize_text(job.get("source")) or "unknown",
        "matchPct": similarity_score,
        "reason": reason,
        "aiRisk": risk["score"],
    }


def find_matching_jobs(
    *,
    resume_text: str,
    skills: List[str],
    role_title: str,
    location: str,
    serpapi_key: str,
    serper_key: str,
    scrapingdog_key: str,
) -> List[Dict[str, object]]:
    query = role_title
    if skills:
        query = f"{role_title} {' '.join(skills[:4])}".strip()

    jobs: List[Dict[str, object]] = []
    try:
        jobs.extend(fetch_serpapi_jobs(serpapi_key, query, location, limit=8))
    except Exception as exc:
        print(f"SerpAPI failed: {exc}")

    try:
        jobs.extend(fetch_serper_jobs(serper_key, query, location, limit=8))
    except Exception as exc:
        print(f"Serper failed: {exc}")

    if not jobs:
        try:
            jobs.extend(fetch_scrapingdog_jobs(scrapingdog_key, query, location, limit=8))
        except Exception as exc:
            print(f"ScrapingDog search failed: {exc}")

    jobs = dedupe_jobs(jobs, limit=12)

    try:
        jobs = enrich_jobs_with_details(jobs, fetch_job_details, scrapingdog_key)
    except Exception as exc:
        print(f"ScrapingDog detail enrichment failed: {exc}")

    ranked_jobs: List[Dict[str, object]] = []
    for job in jobs:
        similarity_score, overlap_skills = _job_similarity(resume_text, skills, job)
        if similarity_score < 18:
            continue
        ranked_jobs.append(_normalize_job(job, similarity_score, overlap_skills))

    ranked_jobs.sort(key=lambda job: int(job.get("matchPct", 0)), reverse=True)
    return ranked_jobs[:10]


def analyze_resume(
    *,
    resume_text: str,
    location: str,
    serpapi_key: str,
    serper_key: str,
    scrapingdog_key: str,
) -> Dict[str, object]:
    cleaned_text = normalize_text(resume_text)
    skills = extract_skills_from_resume(cleaned_text)
    profile = infer_target_role(cleaned_text, skills)
    education_level = extract_education_level(cleaned_text)
    experience_years = extract_experience_years(cleaned_text)
    score = _score_resume(skills, experience_years, education_level)
    risk = _risk_for_profile(profile, skills)
    skill_gaps = _skill_gaps(skills, profile)
    job_matches = find_matching_jobs(
        resume_text=cleaned_text,
        skills=skills,
        role_title=str(profile["title"]),
        location=location,
        serpapi_key=serpapi_key,
        serper_key=serper_key,
        scrapingdog_key=scrapingdog_key,
    )

    return {
        "resume_text": cleaned_text,
        "skills": skills,
        "score": score,
        "job_matches": job_matches,
        "risk": risk,
        "skill_gaps": skill_gaps,
        "target_role": profile["title"],
        "selected_domain": profile["domain"],
        "experience_years": experience_years,
        "education_level": education_level,
    }
