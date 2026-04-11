
from __future__ import annotations

from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from itertools import combinations
from math import sqrt
from typing import DefaultDict, Dict, Iterable, List, Sequence, Set, Tuple
import re
from urllib.parse import urlparse

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


SECTION_PATTERNS = {
    "summary": re.compile(r"^\s*(summary|professional summary|profile|objective|about me)\s*:?\s*$", re.IGNORECASE),
    "experience": re.compile(r"^\s*(experience|work experience|professional experience|employment|internships?|career history)\s*:?\s*$", re.IGNORECASE),
    "projects": re.compile(r"^\s*(projects?|project experience|academic projects?|personal projects?|key projects?)\s*:?\s*$", re.IGNORECASE),
    "skills": re.compile(r"^\s*(skills?|technical skills?|core skills?|competencies|technical proficiencies)\s*:?\s*$", re.IGNORECASE),
    "education": re.compile(r"^\s*(education|academic background|qualifications|academics)\s*:?\s*$", re.IGNORECASE),
    "certifications": re.compile(r"^\s*(certifications?|licenses?|courses|training)\s*:?\s*$", re.IGNORECASE),
}

VALIDATION_INVALID_WORDS = {
    "project", "projects", "resume", "curriculum vitae", "college", "university", "institute", "school",
    "bachelor", "master", "degree", "student", "personal", "team player", "hardworking", "responsible",
    "good communication", "communication", "leadership",
}

GENERIC_SKILL_WORDS = {
    "development", "analysis", "testing", "management", "research", "design", "documentation",
    "implementation", "deployment", "support", "collaboration",
}

STOPWORDS = {
    "a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "is", "it", "of", "on",
    "or", "the", "to", "with", "using", "used", "via", "through", "that", "this", "these",
    "those", "our", "my", "your", "their", "we", "you", "i", "be", "was", "were", "are",
    "have", "has", "had", "can", "will", "may", "also", "over", "under", "across", "within",
}

SKILL_SYNONYMS = {
    "js": "javascript", "ts": "typescript", "py": "python", "nodejs": "node.js", "reactjs": "react",
    "react.js": "react", "nextjs": "next.js", "vuejs": "vue.js", "postgres": "postgresql", "mongo": "mongodb",
    "ms excel": "excel", "microsoft excel": "excel", "powerbi": "power bi", "ci cd": "ci/cd",
    "github actions": "github actions",
}

SKILL_HINTS = {
    "api", "apis", "sdk", "sql", "nosql", "etl", "ml", "nlp", "aws", "azure", "gcp", "docker",
    "kubernetes", "terraform", "excel", "tableau", "power bi", "linux", "git", "github", "jira",
    "figma", "salesforce", "sap", "selenium", "pytest", "fastapi", "django", "flask", "react",
    "angular", "vue", "node.js", "spring", "pandas", "numpy", "tensorflow", "pytorch", "opencv",
    "graphql", "rest",
}

ROLE_ANCHORS = {
    "aws": "Cloud",
    "azure": "Cloud",
    "gcp": "Cloud",
    "docker": "Platform",
    "kubernetes": "Platform",
    "react": "Frontend",
    "angular": "Frontend",
    "vue": "Frontend",
    "typescript": "Frontend",
    "node.js": "Backend",
    "fastapi": "Backend",
    "django": "Backend",
    "flask": "Backend",
    "spring": "Backend",
    "sql": "Data",
    "python": "Python",
    "git": "DevOps",
    "ci/cd": "DevOps",
    "rest apis": "API",
    "rest api": "API",
}

ADJACENT_SKILLS = {
    "aws": ["Cloud Monitoring", "Infrastructure Automation"],
    "docker": ["Kubernetes", "Container Orchestration"],
    "react": ["State Management", "Frontend Performance"],
    "typescript": ["Type-Safe Architecture"],
    "node.js": ["API Design", "Express.js"],
    "python": ["Automation", "Unit Testing"],
    "fastapi": ["Async API Design", "Service Architecture"],
    "sql": ["Data Modeling", "Query Optimization"],
    "git": ["Release Workflow"],
    "ci/cd": ["Deployment Automation"],
}

ROLE_SUFFIXES = {
    "engineer", "developer", "analyst", "manager", "designer", "tester",
}

ROLE_FALLBACK_SUFFIXES = ("engineer", "developer")

DISALLOWED_ROLE_WORDS = {
    "specialist", "consultant", "architect", "administrator", "lead", "researcher", "scientist",
    "expert", "executive", "professional", "associate", "intern", "fresher",
}

ROLE_PLURAL_EXCEPTIONS = {"devops", "analytics"}

ROLE_TITLE_ACRONYMS = {"ai", "ml", "nlp", "qa", "ui", "ux", "api", "sql"}

ROLE_ANCHOR_TITLE_MAP = {
    "ai": "AI",
    "machine learning": "ML",
    "ml": "ML",
    "nlp": "NLP",
    "game testing": "Game",
    "playtesting": "Game",
    "playtester": "Game",
    "playtesters": "Game",
    "bug reporting": "QA",
    "bug tracking": "QA",
    "regression testing": "QA",
    "qa checks": "QA",
    "qa check": "QA",
    "quality assurance": "QA",
}

VERB_TO_ROLE = {
    "develop": "developer", "build": "engineer", "engineer": "engineer", "design": "designer",
    "analy": "analyst", "autom": "engineer", "test": "tester",
    "deploy": "engineer", "manage": "manager",
}

EDUCATION_PATTERNS = [
    ("doctorate", re.compile(r"\b(ph\.?d|doctorate|doctoral)\b", re.IGNORECASE)),
    ("master's", re.compile(r"\b(mba|mca|m\.?tech|m\.?e\b|msc|m\.sc|master(?:'s)?)\b", re.IGNORECASE)),
    ("bachelor's", re.compile(r"\b(bca|bba|bcom|b\.com|bsc|b\.sc|b\.?tech|b\.?e\b|bachelor(?:'s)?)\b", re.IGNORECASE)),
    ("diploma", re.compile(r"\b(diploma|polytechnic|associate degree)\b", re.IGNORECASE)),
]

EMAIL_PATTERN = re.compile(r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b")
PHONE_PATTERN = re.compile(r"\+?\d[\d\s().-]{7,}\d")
YEAR_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\b", re.IGNORECASE)
DATE_PATTERN = re.compile(r"\b(19\d{2}|20\d{2})\b")
TOKEN_PATTERN = re.compile(r"[A-Za-z0-9][A-Za-z0-9+#./&-]*")


@dataclass
class Segment:
    index: int
    section: str
    lines: List[str]

    @property
    def text(self) -> str:
        return normalize_text(" ".join(self.lines))


@dataclass
class SkillEvidence:
    skill: str
    mentions: int = 0
    sections: Set[str] = field(default_factory=set)
    segments: Set[int] = field(default_factory=set)
    forms: Counter[str] = field(default_factory=Counter)
    contexts: List[str] = field(default_factory=list)

    @property
    def score(self) -> float:
        return round((self.mentions * 1.8) + (len(self.sections) * 1.4) + (len(self.segments) * 0.9), 2)


def _clean_line(value: str) -> str:
    value = value.replace("\u2022", " ").replace("\u25cf", " ").replace("\u2023", " ")
    value = re.sub(r"\s+", " ", value).strip(" \t-:|")
    return value.strip()


def _normalize_phrase(value: str) -> str:
    cleaned = normalize_text(value).strip(" .,;:|-")
    cleaned = re.sub(r"^(and|or)\s+", "", cleaned, flags=re.IGNORECASE)
    return cleaned


def _canonical_skill(value: str) -> str:
    cleaned = _normalize_phrase(value).lower()
    cleaned = re.sub(r"\s+", " ", cleaned)
    return SKILL_SYNONYMS.get(cleaned, cleaned).strip()


def _title_case(value: str) -> str:
    if any(ch in value for ch in ".+/#"):
        return value

    words: List[str] = []
    for word in value.split():
        lower = word.lower()
        if lower in ROLE_TITLE_ACRONYMS:
            words.append(lower.upper())
        else:
            words.append(word.capitalize() if word.islower() else word)
    return " ".join(words)


def _tokenize(value: str) -> List[str]:
    return [token.lower() for token in TOKEN_PATTERN.findall(value)]


def _split_sections(resume_text: str) -> Dict[str, List[str]]:
    raw_lines = [_clean_line(line) for line in re.split(r"[\r\n]+", resume_text or "") if _clean_line(line)]
    if not raw_lines:
        return {"general": []}

    sections: DefaultDict[str, List[str]] = defaultdict(list)
    current = "general"
    for line in raw_lines:
        matched = next((name for name, pattern in SECTION_PATTERNS.items() if pattern.match(line)), None)
        if matched:
            current = matched
            continue
        sections[current].append(line)

    if not sections.get("general"):
        sections["general"] = raw_lines[:]
    return dict(sections)


def _sections_to_segments(sections: Dict[str, List[str]]) -> List[Segment]:
    segments: List[Segment] = []
    for section, lines in sections.items():
        buffer: List[str] = []
        for line in lines:
            buffer.append(line)
            if len(buffer) >= 3 or len(line) > 110 or re.search(r"[.;:]$", line):
                segments.append(Segment(index=len(segments), section=section, lines=buffer[:]))
                buffer.clear()
        if buffer:
            segments.append(Segment(index=len(segments), section=section, lines=buffer[:]))
    return segments


def _looks_like_skill(candidate: str, section: str) -> bool:
    normalized = _canonical_skill(candidate)
    if not normalized or len(normalized) < 2 or len(normalized) > 40:
        return False
    if EMAIL_PATTERN.search(normalized) or PHONE_PATTERN.search(normalized):
        return False

    tokens = _tokenize(normalized)
    if not tokens or len(tokens) > 4:
        return False
    if normalized in VALIDATION_INVALID_WORDS:
        return False
    if any(word in normalized for word in ("university", "college", "school", "institute")):
        return False
    if all(token in STOPWORDS for token in tokens):
        return False
    if section == "education" and len(tokens) > 2:
        return False
    if len(tokens) == 1 and tokens[0] in GENERIC_SKILL_WORDS:
        return False
    if normalized.startswith("+") or normalized.isdigit():
        return False
    if section == "skills":
        return True
    if len(tokens) == 1 and normalized not in SKILL_HINTS and not any(ch in normalized for ch in "+#/."):
        return False
    if any(ch.isdigit() for ch in normalized) or any(ch in normalized for ch in "+#/."):
        return True
    if normalized in SKILL_HINTS:
        return True
    return len(tokens) >= 2

def _candidate_phrases_from_line(line: str) -> Iterable[str]:
    for chunk in re.split(r"[,|;/]+|\s+-\s+", line):
        chunk = _normalize_phrase(chunk)
        if chunk:
            yield chunk

    for match in re.finditer(
        r"(?:using|with|built in|built with|developed in|experience with|working with|hands-on with)\s+([A-Za-z0-9][A-Za-z0-9+#./& -]{1,80})",
        line,
        flags=re.IGNORECASE,
    ):
        yield _normalize_phrase(match.group(1))


def _extract_skills_from_sections(sections: Dict[str, List[str]]) -> Dict[str, SkillEvidence]:
    evidence: Dict[str, SkillEvidence] = {}
    segments = _sections_to_segments(sections)

    for segment in segments:
        for line in segment.lines:
            for phrase in _candidate_phrases_from_line(line):
                skill = _canonical_skill(phrase)
                if not _looks_like_skill(skill, segment.section):
                    continue
                entry = evidence.setdefault(skill, SkillEvidence(skill=skill))
                entry.mentions += 1
                entry.sections.add(segment.section)
                entry.segments.add(segment.index)
                entry.forms.update([phrase.strip()])
                entry.contexts.append(line)

    return evidence


def _fallback_skill_extraction(full_text: str, evidence: Dict[str, SkillEvidence]) -> Dict[str, SkillEvidence]:
    for sentence in re.split(r"[.\n]", full_text):
        sentence = _normalize_phrase(sentence)
        if not sentence:
            continue
        for phrase in _candidate_phrases_from_line(sentence):
            skill = _canonical_skill(phrase)
            if not _looks_like_skill(skill, "general"):
                continue
            entry = evidence.setdefault(skill, SkillEvidence(skill=skill))
            entry.mentions += 1
            entry.sections.add("general")
            entry.segments.add(-1)
            entry.forms.update([phrase.strip()])
            entry.contexts.append(sentence)
    return evidence


def _is_invalid_skill(skill: str) -> bool:
    normalized = _canonical_skill(skill)
    if not normalized:
        return True
    if "resume" in normalized:
        return True
    if normalized in VALIDATION_INVALID_WORDS:
        return True
    if any(word in normalized for word in ("university", "college", "school", "campus", "department")):
        return True
    if normalized.startswith("project ") or normalized.endswith(" project"):
        return True
    if normalized in GENERIC_SKILL_WORDS:
        return True
    if normalized.startswith("+") or normalized.isdigit():
        return True
    if len(normalized.split()) > 3:
        return True
    if re.fullmatch(r"[a-z]+", normalized) and len(normalized) <= 2:
        return True
    return False


def _finalize_skills(evidence: Dict[str, SkillEvidence], full_text: str) -> List[str]:
    filtered = [
        item
        for item in evidence.values()
        if not _is_invalid_skill(item.skill)
        and (
            len(item.skill.split()) > 1
            or any(ch in item.skill for ch in "+#/.")
            or item.skill in SKILL_HINTS
            or bool(item.sections & {"skills", "experience", "projects", "certifications"})
        )
    ]
    filtered.sort(key=lambda item: (-item.score, item.skill))
    skills = [item.skill for item in filtered]

    if len(skills) < 5:
        evidence = _fallback_skill_extraction(full_text, evidence)
        filtered = [
            item
            for item in evidence.values()
            if not _is_invalid_skill(item.skill)
            and (
                len(item.skill.split()) > 1
                or any(ch in item.skill for ch in "+#/.")
                or item.skill in SKILL_HINTS
                or bool(item.sections & {"skills", "experience", "projects", "certifications"})
            )
        ]
        filtered.sort(key=lambda item: (-item.score, item.skill))
        skills = [item.skill for item in filtered]

    return list(dict.fromkeys(skills[:25]))


def _build_skill_graph(skills: Sequence[str], evidence: Dict[str, SkillEvidence]) -> Dict[str, Set[str]]:
    adjacency: DefaultDict[str, Set[str]] = defaultdict(set)
    selected = [skill for skill in skills if skill in evidence]

    for left, right in combinations(selected, 2):
        shared_sections = len(evidence[left].sections & evidence[right].sections)
        shared_segments = len(evidence[left].segments & evidence[right].segments)
        lexical_overlap = len(set(_tokenize(left)) & set(_tokenize(right)))
        score = (shared_sections * 1.2) + (shared_segments * 1.8) + (lexical_overlap * 0.5)
        if score >= 1.8:
            adjacency[left].add(right)
            adjacency[right].add(left)

    return dict(adjacency)


def _cluster_skills(skills: Sequence[str], evidence: Dict[str, SkillEvidence]) -> List[Dict[str, object]]:
    adjacency = _build_skill_graph(skills, evidence)
    visited: Set[str] = set()
    clusters: List[Dict[str, object]] = []

    for skill in skills:
        if skill in visited:
            continue
        stack = [skill]
        component: List[str] = []
        while stack:
            current = stack.pop()
            if current in visited:
                continue
            visited.add(current)
            component.append(current)
            stack.extend(adjacency.get(current, set()) - visited)

        component.sort(key=lambda item: (-evidence[item].score, item))
        diversity = len({section for item in component for section in evidence[item].sections})
        density = round(sum(evidence[item].score for item in component) / max(1, len(component)), 2)
        clusters.append(
            {
                "name": " / ".join(_title_case(item) for item in component[:3]),
                "skills": component,
                "density": density,
                "diversity": diversity,
            }
        )

    clusters.sort(key=lambda item: (-float(item["density"]), -len(item["skills"]), str(item["name"])))
    return clusters


def _extract_explicit_titles(sections: Dict[str, List[str]]) -> List[str]:
    candidates: List[str] = []
    for section in ("experience", "summary", "projects", "general"):
        for line in sections.get(section, []):
            cleaned = _normalize_phrase(line)
            if not cleaned:
                continue
            lead_match = re.match(r"^([A-Za-z][A-Za-z /&-]{2,50}?(?:engineer|developer|analyst|manager|designer|tester))\b", cleaned, flags=re.IGNORECASE)
            if lead_match:
                title = _title_case(_normalize_phrase(lead_match.group(1)))
                if _is_valid_role_title(title):
                    candidates.append(title)
                continue
            if len(cleaned.split()) > 7:
                continue
            if any(suffix in cleaned.lower() for suffix in ROLE_SUFFIXES):
                title = _title_case(cleaned)
                if _is_valid_role_title(title):
                    candidates.append(title)

    unique: List[str] = []
    seen = set()
    for item in candidates:
        key = item.lower()
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique


def _role_base_from_text(sections: Dict[str, List[str]], explicit_titles: Sequence[str]) -> List[str]:
    bases: List[str] = []
    for title in explicit_titles:
        for suffix in ROLE_SUFFIXES:
            if title.lower().endswith(suffix):
                bases.append(suffix)
    if bases:
        if "software engineer" in " ".join(title.lower() for title in explicit_titles):
            bases.extend(["developer", "analyst"])
        return list(dict.fromkeys(bases))
    combined_lines = sections.get("summary", []) + sections.get("experience", []) + sections.get("projects", [])
    for line in combined_lines:
        lowered = line.lower()
        for stem, role in VERB_TO_ROLE.items():
            if stem in lowered:
                bases.append(role)
    filtered_bases = [base for base in bases if base in ROLE_SUFFIXES]
    if not filtered_bases:
        filtered_bases.extend(ROLE_FALLBACK_SUFFIXES)
    return list(dict.fromkeys(filtered_bases))


def _role_anchor(skill: str) -> str:
    mapped = ROLE_ANCHORS.get(_canonical_skill(skill))
    if mapped:
        return mapped
    tokens = [token for token in _tokenize(skill) if token not in STOPWORDS]
    if not tokens:
        return ""
    anchor = " ".join(tokens[:2])
    if any(token in {"management", "apis", "api"} for token in tokens):
        return ""
    return _title_case(anchor) if len(anchor) > 2 else ""


def _normalize_role_anchor(anchor: str) -> str:
    mapped_title = ROLE_ANCHOR_TITLE_MAP.get(_canonical_skill(anchor))
    if mapped_title:
        return mapped_title

    tokens = [token for token in _tokenize(anchor) if token not in STOPWORDS]
    if not tokens:
        return ""

    cleaned: List[str] = []
    for token in tokens[:2]:
        if token in {"playtesters", "playtester"}:
            cleaned.append("game")
            continue
        if token in {"qa", "qc"}:
            cleaned.append(token.upper())
            continue
        if token.endswith("ers") and token[:-1].isalpha():
            token = token[:-1]
        elif token.endswith("s") and token not in ROLE_PLURAL_EXCEPTIONS and len(token) > 3 and token.isalpha():
            token = token[:-1]
        cleaned.append(token)

    normalized = " ".join(cleaned).strip()
    return _title_case(normalized)


def _build_role_title(anchor: str, suffix: str) -> str:
    normalized_anchor = _normalize_role_anchor(anchor)
    if not normalized_anchor:
        return ""

    if normalized_anchor in {"AI", "ML", "NLP"}:
        preferred_suffix = "Engineer" if suffix in {"engineer", "developer"} else _title_case(suffix)
        return f"{normalized_anchor} {preferred_suffix}"

    if normalized_anchor == "QA":
        preferred_suffix = "Analyst" if suffix == "analyst" else "Tester"
        return f"{normalized_anchor} {preferred_suffix}"

    if normalized_anchor == "Game" and suffix == "tester":
        return "Game Tester"

    return f"{normalized_anchor} {_title_case(suffix)}"


def _is_valid_role_title(role: str) -> bool:
    normalized = _normalize_phrase(role)
    if not normalized or normalized == normalized.lower():
        return False

    tokens = _tokenize(normalized)
    if len(tokens) < 2 or len(tokens) > 3:
        return False

    suffix = tokens[-1]
    if suffix not in ROLE_SUFFIXES:
        return False

    if any(token in DISALLOWED_ROLE_WORDS for token in tokens):
        return False

    if len(set(tokens)) != len(tokens):
        return False

    if any(token.endswith("s") and token not in ROLE_PLURAL_EXCEPTIONS for token in tokens[:-1]):
        return False

    if any(len(token) <= 1 for token in tokens):
        return False

    return True


def _build_fallback_role(skills: Sequence[str]) -> str:
    for skill in skills:
        anchor = _role_anchor(skill)
        if not anchor:
            continue
        for suffix in ROLE_FALLBACK_SUFFIXES:
            candidate = _build_role_title(anchor, suffix)
            if _is_valid_role_title(candidate):
                return candidate
    return "Software Engineer"


def _infer_required_skills(role_title: str, skills: Sequence[str], clusters: Sequence[Dict[str, object]], evidence: Dict[str, SkillEvidence]) -> List[str]:
    title_tokens = set(_tokenize(role_title))
    scored: List[Tuple[float, str]] = []

    for skill in skills:
        skill_tokens = set(_tokenize(skill))
        overlap = len(title_tokens & skill_tokens)
        cluster_bonus = 0.0
        frequency = 0
        for cluster in clusters:
            if skill in cluster["skills"]:
                frequency += 1
                if title_tokens & set(_tokenize(cluster["name"])):
                    cluster_bonus += 1.2
        score = (overlap * 2.5) + cluster_bonus + (evidence[skill].score * 0.22) + sqrt(max(1, frequency))
        if score > 0.6:
            scored.append((score, skill))

    scored.sort(key=lambda item: (-item[0], item[1]))
    required = [skill for _, skill in scored[:6]]
    adjacent: List[str] = []
    for skill in required[:4]:
        for suggestion in ADJACENT_SKILLS.get(skill, []):
            if _canonical_skill(suggestion) not in {_canonical_skill(item) for item in required}:
                adjacent.append(suggestion)
    required.extend(adjacent[:2])
    if len(required) < 3:
        required = list(dict.fromkeys(list(required) + list(skills[:5])))
    return list(dict.fromkeys(required))[:8]


def _generate_roles(skills: Sequence[str], clusters: Sequence[Dict[str, object]], evidence: Dict[str, SkillEvidence], explicit_titles: Sequence[str], sections: Dict[str, List[str]]) -> List[Dict[str, object]]:
    roles: List[str] = list(explicit_titles)
    bases = _role_base_from_text(sections, explicit_titles)

    for cluster in clusters[:8]:
        anchor_skill = next((skill for skill in cluster["skills"] if len(skill.split()) <= 2), cluster["skills"][0])
        anchor = _role_anchor(anchor_skill)
        if not anchor:
            continue
        for base in bases[:3]:
            roles.append(_build_role_title(anchor, base).strip())

    for skill in [item for item in skills if len(item.split()) <= 2][:10]:
        anchor = _role_anchor(skill)
        if not anchor:
            continue
        for base in bases[:2]:
            roles.append(_build_role_title(anchor, base).strip())

    if not roles:
        roles.append(_build_fallback_role(skills))

    unique_roles: List[str] = []
    seen = set()
    for role in roles:
        normalized = _title_case(_normalize_phrase(role))
        lowered = normalized.lower()
        if not normalized or lowered in seen:
            continue
        if not _is_valid_role_title(normalized):
            continue
        seen.add(lowered)
        unique_roles.append(normalized)

    if not unique_roles:
        unique_roles.append(_build_fallback_role(skills))

    generated = [{"title": role, "requiredSkills": _infer_required_skills(role, skills, clusters, evidence)} for role in unique_roles[:15]]
    return [role for role in generated if len(role["requiredSkills"]) >= 3]


def _expand_related_roles(primary_roles: Sequence[Dict[str, object]], clusters: Sequence[Dict[str, object]]) -> List[str]:
    expanded: List[str] = []
    seen = set()
    bases = ["engineer", "developer", "analyst", "manager", "designer", "tester"]

    for role in primary_roles[:8]:
        title = str(role["title"])
        title_tokens = [token for token in _tokenize(title) if token not in ROLE_SUFFIXES]
        for cluster in clusters[:6]:
            cluster_anchor = next((skill for skill in cluster["skills"] if len(skill.split()) <= 2), "")
            anchor_tokens = [token for token in _tokenize(cluster_anchor) if token not in STOPWORDS]
            merged = title_tokens[:1] + anchor_tokens[:1]
            if not merged:
                continue
            anchor = " ".join(merged)
            for base in bases[:3]:
                candidate = _build_role_title(anchor, base)
                if _is_valid_role_title(candidate) and candidate.lower() not in seen and candidate.lower() != title.lower():
                    seen.add(candidate.lower())
                    expanded.append(candidate)
    return expanded[:20]

def _match_role(role: Dict[str, object], resume_skills: Sequence[str]) -> Tuple[float, List[str], List[str]]:
    required = list(dict.fromkeys(_canonical_skill(skill) for skill in role["requiredSkills"]))
    present = {_canonical_skill(skill) for skill in resume_skills}
    matched = [skill for skill in required if skill in present]
    missing = [skill for skill in required if skill not in present]
    total_required = len(required) or 1
    score = round((len(matched) / total_required) * 100, 2)
    return min(score, 96.0), matched, missing


def _demand_for_role(role: Dict[str, object], roles: Sequence[Dict[str, object]], clusters: Sequence[Dict[str, object]]) -> Dict[str, object]:
    required = role["requiredSkills"]
    cross_role_count = sum(1 for candidate in roles if set(required) & set(candidate["requiredSkills"]))
    cluster_coverage = sum(1 for cluster in clusters if set(required) & set(cluster["skills"]))
    diversity = len(set(required))
    value = min(100, round((diversity * 4) + (cross_role_count * 2) + (cluster_coverage * 5)))
    label = "High" if value >= 70 else "Medium" if value >= 45 else "Low"
    return {"value": value, "label": label}


def _risk_from_match(match_percentage: float) -> Dict[str, object]:
    value = int(max(4, min(95, round(100 - match_percentage))))
    label = "Low" if value <= 30 else "Medium" if value <= 60 else "High"
    return {"value": value, "label": label}


def _what_if(role_title: str, required: Sequence[str], matched: Sequence[str]) -> str:
    missing = [skill for skill in required if skill not in matched]
    if not missing:
        return f"If you deepen one adjacent skill, {role_title} alignment can improve further."
    current = round((len(matched) / max(1, len(required))) * 100, 2)
    improved = min(96.0, round(((len(matched) + 1) / max(1, len(required))) * 100, 2))
    return f"If {missing[0]} is added, match increases from {current}% to {improved}%."


def _build_jobs(roles: Sequence[Dict[str, object]], resume_skills: Sequence[str], clusters: Sequence[Dict[str, object]], location: str) -> List[Dict[str, object]]:
    jobs: List[Dict[str, object]] = []
    for role in roles:
        match_percentage, matched, missing = _match_role(role, resume_skills)
        if match_percentage <= 30:
            continue
        demand = _demand_for_role(role, roles, clusters)
        risk = _risk_from_match(match_percentage)
        jobs.append(
            {
                "id": make_job_id(str(role["title"]), "", location),
                "title": str(role["title"]),
                "matchPercentage": match_percentage,
                "demand": demand,
                "risk": risk,
                "matchedSkills": [_title_case(skill) for skill in matched],
                "missingSkills": [_title_case(skill) for skill in missing[:6]],
                "whatIf": _what_if(str(role["title"]), role["requiredSkills"], matched),
                "requiredSkills": [_title_case(skill) for skill in role["requiredSkills"]],
                "company": "",
                "location": location,
                "type": "Inferred",
                "salary": "Not specified",
                "experience": "Not specified",
                "posted": "Resume-derived",
                "description": f"Resume-derived role based on clustered evidence from {', '.join(_title_case(skill) for skill in role['requiredSkills'][:4])}.",
                "requirements": [_title_case(skill) for skill in role["requiredSkills"]],
                "matchPct": match_percentage,
                "aiRisk": risk["value"],
                "whatIfAnalysis": [{"skill": _title_case(missing[0]), "message": _what_if(str(role["title"]), role["requiredSkills"], matched)}] if missing else [],
                "reason": f"Matched {len(matched)} of {len(role['requiredSkills'])} inferred required skills.",
                "link": "",
                "apply_link": "",
                "source": "resume-inference",
            }
        )

    jobs.sort(key=lambda item: (-float(item["matchPercentage"]), float(item["risk"]["value"]), item["title"]))
    return jobs[:12]


def _overall_demand(resume_skills: Sequence[str], roles: Sequence[Dict[str, object]], jobs: Sequence[Dict[str, object]]) -> Dict[str, object]:
    if not jobs:
        return {"value": 0, "label": "Low"}
    skill_diversity = min(35, len(resume_skills) * 3)
    cross_role = min(35, len(roles) * 4)
    role_frequency = min(30, round(sum(job["demand"]["value"] for job in jobs[:5]) / max(1, min(len(jobs), 5)) * 0.3))
    value = int(min(100, skill_diversity + cross_role + role_frequency))
    label = "High" if value >= 70 else "Medium" if value >= 45 else "Low"
    return {"value": value, "label": label}


def _overall_risk(jobs: Sequence[Dict[str, object]], roles: Sequence[Dict[str, object]]) -> Dict[str, object]:
    if not jobs:
        title = roles[0]["title"] if roles else ""
        return {"score": 95, "label": "High", "role": title, "explanation": "Too few aligned role signals were found in the resume."}
    pool = jobs[: min(5, len(jobs))]
    value = int(round(sum(job["risk"]["value"] for job in pool) / len(pool)))
    label = "Low" if value <= 30 else "Medium" if value <= 60 else "High"
    return {"score": value, "label": label, "role": pool[0]["title"], "explanation": "Risk is the inverse of current inferred role match percentages."}


def _calculate_profile_score(skills: Sequence[str], roles: Sequence[Dict[str, object]], jobs: Sequence[Dict[str, object]], clusters: Sequence[Dict[str, object]], experience_years: float, education_level: str) -> int:
    avg_match = round(sum(job["matchPercentage"] for job in jobs[:5]) / max(1, min(5, len(jobs)))) if jobs else 0
    value = (
        min(28, len(skills) * 3)
        + min(18, len(clusters) * 5)
        + min(18, len(roles) * 3)
        + min(16, round(experience_years * 3))
        + {"doctorate": 10, "master's": 8, "bachelor's": 6, "diploma": 4}.get(education_level, 0)
        + min(20, round(avg_match * 0.2))
    )
    return int(max(0, min(100, value)))


def extract_education_level(resume_text: str) -> str:
    for label, pattern in EDUCATION_PATTERNS:
        if pattern.search(resume_text):
            return label
    return ""


def extract_experience_years(resume_text: str) -> float:
    year_mentions = [float(match.group(1)) for match in YEAR_PATTERN.finditer(resume_text)]
    if year_mentions:
        return max(year_mentions)
    years = sorted({int(value) for value in DATE_PATTERN.findall(resume_text)})
    if len(years) >= 2:
        span = years[-1] - years[0]
        if 0 < span <= 45:
            return float(span)
    return 0.0


def _extract_contact_signals(resume_text: str) -> Dict[str, bool]:
    lowered = normalize_text(resume_text).lower()
    return {
        "has_email": bool(EMAIL_PATTERN.search(lowered)),
        "has_phone": bool(PHONE_PATTERN.search(lowered)),
        "has_linkedin": "linkedin" in lowered,
        "has_github": "github" in lowered,
        "has_portfolio": "portfolio" in lowered,
    }


def _is_valid_apply_link(url: object) -> bool:
    candidate = normalize_text(url)
    if not candidate:
        return False

    try:
        parsed = urlparse(candidate)
    except Exception:
        return False

    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def _looks_like_real_job_title(title: str) -> bool:
    normalized = _normalize_phrase(title)
    lowered = normalized.lower()
    if not normalized or lowered == normalized:
        return False
    if "resume-derived" in lowered or "specialist" in lowered:
        return False
    tokens = _tokenize(normalized)
    if len(tokens) < 2 or len(tokens) > 6:
        return False
    if any(token.endswith("s") and token not in ROLE_PLURAL_EXCEPTIONS for token in tokens[:-1]):
        return False
    return True


def _sanitize_external_job_title(title: str) -> str:
    cleaned = normalize_text(title)
    if not cleaned:
        return ""

    cleaned = re.split(r"\s+[|\-]\s+", cleaned, maxsplit=1)[0]
    cleaned = re.sub(r"^\d[\d,]*\s+", "", cleaned)
    cleaned = re.sub(r"\bjobs?\s+in\s+india\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\bjobs?\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\b(vacancies|openings|positions)\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" -|,")
    return _title_case(cleaned)


def _job_title_match_percentage(title: str, description: str, resume_skills: Sequence[str]) -> float:
    corpus = f"{title} {description}".lower()
    matched_skills: Set[str] = set()
    for skill in resume_skills:
        canonical = _canonical_skill(skill)
        if not canonical:
            continue
        skill_tokens = [token for token in _tokenize(canonical) if token not in STOPWORDS]
        if not skill_tokens:
            continue

        if canonical.lower() in corpus or any(token in corpus for token in skill_tokens):
            matched_skills.add(canonical)
            continue

    total_skills = max(1, len({_canonical_skill(skill) for skill in resume_skills if _canonical_skill(skill)}))
    score = (len(matched_skills) / total_skills) * 100
    return round(max(20.0, min(95.0, score)), 2)


def _normalize_live_job(
    raw_job: Dict[str, object],
    *,
    role_title: str,
    location: str,
    resume_skills: Sequence[str],
    fallback: bool = False,
) -> Dict[str, object] | None:
    title = _sanitize_external_job_title(normalize_text(raw_job.get("title")))
    if not title or len(title.split()) < 2:
        return None

    apply_link = normalize_text(
        raw_job.get("apply_link")
        or raw_job.get("link")
        or raw_job.get("url")
        or raw_job.get("redirect_link")
    )
    if not _is_valid_apply_link(apply_link):
        return None

    description = normalize_text(raw_job.get("description"))
    company = _title_case(normalize_text(raw_job.get("company") or raw_job.get("source"))) or "Unknown Company"
    location_value = normalize_text(raw_job.get("location")) or location
    match_percentage = _job_title_match_percentage(title, description, resume_skills)
    risk = _risk_from_match(match_percentage)
    lowered_title = title.lower()
    if "developer" in lowered_title or "engineer" in lowered_title:
        demand_value = 80
    elif "analyst" in lowered_title or "tester" in lowered_title:
        demand_value = 55
    else:
        demand_value = 30
    demand = {
        "value": demand_value,
        "label": "High" if demand_value >= 70 else "Medium" if demand_value >= 45 else "Low",
    }
    source = normalize_text(raw_job.get("source")) or ("fallback" if fallback else "external")

    return {
        "id": make_job_id(title, company, location_value),
        "title": title,
        "company": company,
        "location": location_value,
        "salary": normalize_text(raw_job.get("salary")) or "Not specified",
        "description": description or f"Live job result for {title}.",
        "apply_link": apply_link,
        "link": apply_link,
        "type": normalize_text(raw_job.get("type")) or ("Fallback" if fallback else "Live"),
        "posted": normalize_text(raw_job.get("posted")) or "Recently",
        "experience": normalize_text(raw_job.get("experience")) or "Not specified",
        "requirements": [_title_case(skill) for skill in resume_skills[:6]],
        "matchPercentage": match_percentage,
        "matchPct": match_percentage,
        "demand": demand,
        "risk": risk,
        "aiRisk": risk["value"],
        "matchedSkills": [_title_case(skill) for skill in resume_skills[:6]],
        "missingSkills": [],
        "whatIf": f"Strengthen one more aligned skill to improve fit for {title}.",
        "whatIfAnalysis": [],
        "requiredSkills": [_title_case(skill) for skill in resume_skills[:6]],
        "reason": f"Matched against resume skills for {role_title}.",
        "source": source,
        "job_source": source,
        "fallback": fallback,
    }


def fetch_jobs_for_role(
    role: str,
    location: str,
    *,
    serpapi_key: str,
    serper_key: str,
    scrapingdog_key: str,
    limit: int = 5,
) -> List[Dict[str, object]]:
    if not role or "specialist" in role.lower():
        return []

    def _fetch_for_query(query_role: str) -> List[Dict[str, object]]:
        fetched_batch: List[Dict[str, object]] = []
        sources = [
            lambda: fetch_serpapi_jobs(serpapi_key, query_role, location, limit=limit),
            lambda: fetch_serper_jobs(serper_key, query_role, location, limit=limit),
            lambda: fetch_scrapingdog_jobs(scrapingdog_key, query_role, location, limit=limit),
        ]

        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(source) for source in sources]
            for future in as_completed(futures):
                try:
                    result = future.result() or []
                except Exception:
                    result = []
                if isinstance(result, list):
                    fetched_batch.extend(job for job in result if isinstance(job, dict))
        return fetched_batch

    fetched = _fetch_for_query(role)
    print("Fetched jobs:", len(fetched))

    if not fetched:
        for broader_role in ("software jobs", "IT jobs"):
            fetched = _fetch_for_query(broader_role)
            print("Fetched jobs:", len(fetched))
            if fetched:
                break

    fetched = dedupe_jobs(fetched, limit * 3)
    return enrich_jobs_with_details(fetched, fetch_job_details, scrapingdog_key, max_jobs=3)


def _discover_live_jobs(
    *,
    roles: Sequence[Dict[str, object]],
    resume_skills: Sequence[str],
    location: str,
    serpapi_key: str,
    serper_key: str,
    scrapingdog_key: str,
) -> List[Dict[str, object]]:
    collected: List[Dict[str, object]] = []

    for role in roles[:4]:
        title = normalize_text(role.get("title"))
        if not title or "specialist" in title.lower():
            continue

        for job in fetch_jobs_for_role(
            title,
            location,
            serpapi_key=serpapi_key,
            serper_key=serper_key,
            scrapingdog_key=scrapingdog_key,
        ):
            normalized = _normalize_live_job(
                job,
                role_title=title,
                location=location,
                resume_skills=resume_skills,
            )
            if normalized:
                collected.append(normalized)

    print("After filter:", len(collected))

    deduped = dedupe_jobs(collected, 15)
    deduped.sort(
        key=lambda item: (
            -float(item.get("matchPercentage", 0)),
            -float(item.get("demand", {}).get("value", 0)),
            str(item.get("title", "")),
        )
    )
    if deduped:
        return deduped[:15]

    for broader_role in ("software jobs", "IT jobs"):
        broader_jobs = fetch_jobs_for_role(
            broader_role,
            location,
            serpapi_key=serpapi_key,
            serper_key=serper_key,
            scrapingdog_key=scrapingdog_key,
        )
        normalized_jobs = [
            _normalize_live_job(
                job,
                role_title=broader_role,
                location=location,
                resume_skills=resume_skills,
            )
            for job in broader_jobs
        ]
        normalized_jobs = [job for job in normalized_jobs if job]
        print("After filter:", len(normalized_jobs))
        if normalized_jobs:
            normalized_jobs = dedupe_jobs(normalized_jobs, 15)
            normalized_jobs.sort(
                key=lambda item: (
                    -float(item.get("matchPercentage", 0)),
                    -float(item.get("demand", {}).get("value", 0)),
                    str(item.get("title", "")),
                )
            )
            return normalized_jobs[:15]

    return []


def _mark_fallback_jobs(jobs: Sequence[Dict[str, object]]) -> List[Dict[str, object]]:
    fallback_jobs: List[Dict[str, object]] = []
    for job in jobs:
        copied = dict(job)
        copied["source"] = "fallback"
        copied["job_source"] = "fallback"
        copied["fallback"] = True
        copied["type"] = "Fallback"
        fallback_jobs.append(copied)
    return fallback_jobs


def _build_minimum_fallback_jobs(skills: Sequence[str], location: str) -> List[Dict[str, object]]:
    base_title = _build_fallback_role(skills)
    match_percentage = _job_title_match_percentage(base_title, base_title, skills)
    risk = _risk_from_match(match_percentage)
    lowered_title = base_title.lower()
    if "developer" in lowered_title or "engineer" in lowered_title:
        demand = {"value": 80, "label": "High"}
    elif "analyst" in lowered_title or "tester" in lowered_title:
        demand = {"value": 55, "label": "Medium"}
    else:
        demand = {"value": 30, "label": "Low"}

    return [
        {
            "id": make_job_id(base_title, "Fallback Source", location),
            "title": base_title,
            "company": "Fallback Source",
            "location": location,
            "salary": "Not specified",
            "description": f"Fallback job generated for {base_title}.",
            "apply_link": "https://www.linkedin.com/jobs/",
            "link": "https://www.linkedin.com/jobs/",
            "type": "Fallback",
            "posted": "Recently",
            "experience": "Not specified",
            "requirements": [_title_case(skill) for skill in skills[:6]],
            "matchPercentage": match_percentage,
            "matchPct": match_percentage,
            "demand": demand,
            "risk": risk,
            "aiRisk": risk["value"],
            "matchedSkills": [_title_case(skill) for skill in skills[:6]],
            "missingSkills": [],
            "whatIf": f"Strengthen one more aligned skill to improve fit for {base_title}.",
            "whatIfAnalysis": [],
            "requiredSkills": [_title_case(skill) for skill in skills[:6]],
            "reason": "Fallback job generated because live APIs returned no jobs.",
            "source": "fallback",
            "job_source": "fallback",
            "fallback": True,
        }
    ]


def _validate_output(payload: Dict[str, object]) -> bool:
    skills = payload.get("skills", [])
    jobs = payload.get("jobs", [])
    if not isinstance(skills, list) or len(skills) < 3:
        return False
    if any(_is_invalid_skill(str(skill)) for skill in skills):
        return False
    if not isinstance(jobs, list):
        return False
    for job in jobs:
        if not isinstance(job, dict):
            return False
        for skill in list(job.get("matchedSkills", [])) + list(job.get("missingSkills", [])):
            if _is_invalid_skill(str(skill)):
                return False
    return True

def _assemble_analysis(resume_text: str, location: str) -> Dict[str, object]:
    sections = _split_sections(resume_text)
    evidence = _extract_skills_from_sections(sections)
    skills = _finalize_skills(evidence, resume_text)
    clusters = _cluster_skills(skills, evidence) if skills else []
    explicit_titles = _extract_explicit_titles(sections)
    roles = _generate_roles(skills, clusters, evidence, explicit_titles, sections)
    jobs = _build_jobs(roles, skills, clusters, location)
    demand = _overall_demand(skills, roles, jobs)
    risk = _overall_risk(jobs, roles)
    education_level = extract_education_level(resume_text)
    experience_years = extract_experience_years(resume_text)
    score = _calculate_profile_score(skills, roles, jobs, clusters, experience_years, education_level)
    expanded_roles = _expand_related_roles(roles, clusters)
    skill_gaps = list(dict.fromkeys(skill for job in jobs for skill in job["missingSkills"]))[:15]

    strict_jobs = [
        {
            "title": job["title"],
            "matchPercentage": job["matchPercentage"],
            "demand": job["demand"],
            "risk": job["risk"],
            "matchedSkills": job["matchedSkills"],
            "missingSkills": job["missingSkills"],
            "whatIf": job["whatIf"],
        }
        for job in jobs
    ]

    structured_output = {
        "skills": [_title_case(skill) for skill in skills],
        "roles": [role["title"] for role in roles],
        "jobs": strict_jobs,
        "score": score,
    }

    role_strengths = {job["title"]: job["matchPercentage"] for job in strict_jobs}
    role_missing = {job["title"]: job["missingSkills"] for job in strict_jobs}
    role_matched = {job["title"]: job["matchedSkills"] for job in strict_jobs}

    return {
        "resume_text": normalize_text(resume_text),
        "sections": sections,
        "skills": structured_output["skills"],
        "tools": [_title_case(skill) for skill in skills if any(ch in skill for ch in ".+/#") or skill in SKILL_HINTS][:10],
        "soft_skills": [],
        "technologies": structured_output["skills"],
        "knowledge_areas": [cluster["name"] for cluster in clusters[:10]],
        "keywords": [_title_case(skill) for skill in skills[:20]],
        "domains": [{"name": cluster["name"], "score": cluster["density"], "skills": [_title_case(skill) for skill in cluster["skills"]]} for cluster in clusters],
        "capability_clusters": [{"name": cluster["name"], "capabilities": [_title_case(skill) for skill in cluster["skills"]], "density": cluster["density"], "adaptability": min(100, cluster["diversity"] * 18 + len(cluster["skills"]) * 8)} for cluster in clusters],
        "roles": [{"title": role["title"], "matchedSkills": role_matched.get(role["title"], []), "requiredSkills": [_title_case(skill) for skill in role["requiredSkills"]], "strength": role_strengths.get(role["title"], 0), "missingSkills": role_missing.get(role["title"], [])} for role in roles],
        "generated_roles": roles,
        "job_matches": jobs,
        "score": score,
        "risk": risk,
        "demand": demand,
        "skill_gaps": skill_gaps,
        "target_role": roles[0]["title"] if roles else "",
        "selected_domain": clusters[0]["name"] if clusters else "",
        "experience_years": experience_years,
        "education_level": education_level,
        "expanded_roles": expanded_roles,
        "all_roles": [role["title"] for role in roles] + expanded_roles,
        "contact_signals": _extract_contact_signals(resume_text),
        "structured_output": structured_output,
    }


def analyze_resume(*, resume_text: str, location: str, serpapi_key: str, serper_key: str, scrapingdog_key: str) -> Dict[str, object]:
    cleaned = resume_text.strip()
    analysis = _assemble_analysis(cleaned, location)
    if _validate_output(analysis["structured_output"]):
        pass
    else:
        retry_text = re.sub(r"\s+", " ", cleaned)
        analysis = _assemble_analysis(retry_text, location)
        if not _validate_output(analysis["structured_output"]):
            softened_text = re.sub(r"[^A-Za-z0-9+#./&,\n -]", " ", cleaned)
            analysis = _assemble_analysis(softened_text, location)

    live_jobs = _discover_live_jobs(
        roles=analysis["generated_roles"],
        resume_skills=analysis["skills"],
        location=location,
        serpapi_key=serpapi_key,
        serper_key=serper_key,
        scrapingdog_key=scrapingdog_key,
    )

    if live_jobs:
        analysis["job_matches"] = live_jobs
        analysis["structured_output"]["jobs"] = [
            {
                "title": job["title"],
                "matchPercentage": job["matchPercentage"],
                "demand": job["demand"],
                "risk": job["risk"],
                "matchedSkills": job["matchedSkills"],
                "missingSkills": job["missingSkills"],
                "whatIf": job["whatIf"],
                "company": job["company"],
                "location": job["location"],
                "apply_link": job["apply_link"],
                "source": job["source"],
            }
            for job in live_jobs
        ]
        analysis["risk"] = _overall_risk(live_jobs, analysis["generated_roles"])
        analysis["demand"] = _overall_demand(analysis["skills"], analysis["generated_roles"], live_jobs)
    else:
        fallback_jobs = _mark_fallback_jobs(analysis["job_matches"])
        if not fallback_jobs:
            fallback_jobs = _build_minimum_fallback_jobs(analysis["skills"], location)
        analysis["job_matches"] = fallback_jobs
        analysis["structured_output"]["jobs"] = [
            {
                "title": job["title"],
                "matchPercentage": job["matchPercentage"],
                "demand": job["demand"],
                "risk": job["risk"],
                "matchedSkills": job["matchedSkills"],
                "missingSkills": job["missingSkills"],
                "whatIf": job["whatIf"],
                "company": job.get("company", ""),
                "location": job.get("location", location),
                "apply_link": job.get("apply_link", ""),
                "source": "fallback",
            }
            for job in fallback_jobs
        ]

    return analysis


def discover_jobs_for_skills(*, skills: Sequence[str], location: str, resume_text: str, serpapi_key: str, serper_key: str, scrapingdog_key: str) -> Dict[str, object]:
    merged_text = normalize_text(f"{resume_text} {' '.join(skill for skill in skills if skill)}")
    analysis = analyze_resume(
        resume_text=merged_text,
        location=location,
        serpapi_key=serpapi_key,
        serper_key=serper_key,
        scrapingdog_key=scrapingdog_key,
    )
    return {
        "roles": analysis["roles"],
        "jobs": analysis["job_matches"],
        "demand": analysis["demand"],
        "risk": analysis["risk"],
        "target_role": analysis["target_role"],
        "selected_domain": analysis["selected_domain"],
        "domains": analysis["domains"],
        "structured_output": analysis["structured_output"],
    }
