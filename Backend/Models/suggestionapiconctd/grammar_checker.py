"""
Resume Grammar Checker (Free + Fallback)
Primary: LanguageTool Public API
Secondary: TextGears API
No Java required
Production Ready
"""

import requests
import re
from typing import List, Dict
import os
from pathlib import Path
from dotenv import load_dotenv

# Load the workspace-level .env (walk up from this file path).
for _parent in Path(__file__).resolve().parents:
    _env_file = _parent / ".env"
    if _env_file.exists():
        load_dotenv(_env_file, override=False)
        break

# =====================================================
# API CONFIG
# =====================================================

LANGUAGETOOL_URL = os.getenv("LANGUAGETOOL_URL", "https://api.languagetool.org/v2/check")

TEXTGEARS_URL = os.getenv("TEXTGEARS_URL", "https://api.textgears.com/grammar")
TEXTGEARS_API_KEY = os.getenv("TEXTGEARS_API_KEY", "VgJiCXkgihkk0srs")

TIMEOUT = 15

# =====================================================
# WHITELIST (Tech + Certifications)
# =====================================================

WHITELIST_TERMS = {
    # Certifications
    "pmp", "csm", "psm", "safe", "agilist",
    "itil", "prince2", "scrummaster",

    # Programming
    "python", "java", "javascript", "typescript",
    "react", "nodejs", "node", "django", "flask",
    "fastapi", "springboot", "angular", "vue",
    "aws", "azure", "gcp", "docker", "kubernetes",
    "sql", "mongodb", "postgresql", "mysql",
    "github", "git", "jira", "ci/cd"
}

def is_whitelisted(word: str) -> bool:
    return word.lower().strip() in WHITELIST_TERMS

def is_acronym(word: str) -> bool:
    return word.isupper() and len(word) >= 2

def is_url_or_email(text: str) -> bool:
    return bool(re.search(r'https?://|www\.|@', text))

# =====================================================
# PRIMARY — LanguageTool Public API
# =====================================================

def check_with_languagetool(text: str) -> List[Dict]:

    payload = {
        "text": text,
        "language": "en-US"
    }

    response = requests.post(
        LANGUAGETOOL_URL,
        data=payload,
        timeout=TIMEOUT
    )

    response.raise_for_status()
    data = response.json()

    issues = []

    for match in data.get("matches", []):
        offset = match["offset"]
        length = match["length"]
        error_text = text[offset: offset + length]

        if (
            not error_text.strip()
            or is_whitelisted(error_text)
            or is_acronym(error_text)
            or is_url_or_email(error_text)
        ):
            continue

        suggestion = (
            match["replacements"][0]["value"]
            if match["replacements"] else "No suggestion"
        )

        issues.append({
            "error": error_text,
            "suggestion": suggestion,
            "reason": match["message"],
            "category": match["rule"].get("issueType", "grammar"),
            "rule_id": match["rule"].get("id", "languagetool"),
            "offset": offset,
            "context": text[max(0, offset-40):offset+40]
        })

    return issues


# =====================================================
# SECONDARY — TextGears Fallback
# =====================================================

def check_with_textgears(text: str) -> List[Dict]:

    payload = {
        "text": text,
        "language": "en-US",
        "key": TEXTGEARS_API_KEY
    }

    response = requests.post(
        TEXTGEARS_URL,
        data=payload,
        timeout=TIMEOUT
    )

    response.raise_for_status()
    data = response.json()

    issues = []

    for err in data.get("response", {}).get("errors", []):
        bad = err["bad"]

        if is_whitelisted(bad) or is_acronym(bad):
            continue

        issues.append({
            "error": bad,
            "suggestion": err["better"][0] if err["better"] else "No suggestion",
            "reason": err["description"]["en"],
            "category": "grammar",
            "rule_id": "textgears",
            "offset": err["offset"],
            "context": text[max(0, err["offset"]-40):err["offset"]+40]
        })

    return issues


# =====================================================
# MAIN FUNCTION
# =====================================================

def grammar_analysis(text: str) -> List[Dict]:

    if not text or not text.strip():
        return []

    try:
        # Try LanguageTool first
        issues = check_with_languagetool(text)

        # If it returns empty but should detect obvious errors,
        # we still trust it (no fallback unless API fails)
        return issues

    except Exception:
        # If LanguageTool fails (timeout / server issue)
        return check_with_textgears(text)


# =====================================================
# UTILITIES (Required by app.py)
# =====================================================

def get_error_count(issues: List[Dict]) -> int:
    return len(issues)

def get_errors_by_category(issues: List[Dict]) -> Dict[str, int]:
    summary = {}
    for issue in issues:
        cat = issue.get("category", "UNKNOWN")
        summary[cat] = summary.get(cat, 0) + 1
    return summary

def has_errors(issues: List[Dict]) -> bool:
    return len(issues) > 0

def filter_by_category(issues: List[Dict], category: str) -> List[Dict]:
    return [i for i in issues if i.get("category") == category]
