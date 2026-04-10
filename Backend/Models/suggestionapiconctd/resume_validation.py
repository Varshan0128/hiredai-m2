import re
from pathlib import Path
from typing import Dict, Set

INVALID_RESUME_MESSAGE = "Invalid resume file. Please upload a valid resume."

ALLOWED_RESUME_MIME_TYPES: Dict[str, Set[str]] = {
    ".pdf": {
        "application/pdf",
        "application/x-pdf",
    },
    ".docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/zip",
    },
}

RESUME_SECTION_PATTERNS = {
    "education": re.compile(r"\beducation\b", re.IGNORECASE),
    "experience": re.compile(r"\bexperience\b", re.IGNORECASE),
    "skills": re.compile(r"\bskills?\b", re.IGNORECASE),
    "projects": re.compile(r"\bprojects?\b", re.IGNORECASE),
}

EMAIL_PATTERN = re.compile(r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b")
PHONE_PATTERN = re.compile(
    r"(?:(?:(?:\+?\d{1,3})[\s.-]*)?(?:\(?\d{3}\)?[\s.-]*)\d{3}[\s.-]*\d{4}|\+?\d[\d\s().-]{7,}\d)"
)


def normalize_mime_type(content_type: str | None) -> str:
    return (content_type or "").split(";", 1)[0].strip().lower()


def get_file_extension(filename: str | None) -> str:
    return Path(filename or "").suffix.lower()


def is_allowed_resume_upload(filename: str | None, content_type: str | None) -> bool:
    extension = get_file_extension(filename)
    allowed_mime_types = ALLOWED_RESUME_MIME_TYPES.get(extension)
    if not allowed_mime_types:
        return False
    return normalize_mime_type(content_type) in allowed_mime_types


def extract_resume_signals(text: str) -> Dict[str, object]:
    normalized_text = " ".join((text or "").split())
    matched_sections = {
        name for name, pattern in RESUME_SECTION_PATTERNS.items() if pattern.search(normalized_text)
    }

    return {
        "matched_sections": matched_sections,
        "has_email": bool(EMAIL_PATTERN.search(normalized_text)),
        "has_phone": bool(PHONE_PATTERN.search(normalized_text)),
    }


def is_valid_resume_text(text: str) -> bool:
    signals = extract_resume_signals(text)
    matched_sections = signals["matched_sections"]
    return (
        len(matched_sections) >= 3
        and bool(signals["has_email"])
        and bool(signals["has_phone"])
    )
