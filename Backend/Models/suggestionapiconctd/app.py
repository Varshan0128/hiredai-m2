"""
Resume Grammar Checker API (Debug Version)
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import tempfile
import os
import uvicorn
import requests
from pathlib import Path
from dotenv import load_dotenv

# Import grammar checker
from grammar_checker import (
    grammar_analysis,
    get_errors_by_category,
    get_error_count,
    has_errors,
    filter_by_category
)

from file_reader import read_resume_file

# Load the workspace-level .env (walk up from this file path).
for _parent in Path(__file__).resolve().parents:
    _env_file = _parent / ".env"
    if _env_file.exists():
        load_dotenv(_env_file, override=False)
        break


def _to_int(value: Optional[str], default: int) -> int:
    try:
        return int(value) if value is not None else default
    except ValueError:
        return default


PYTHON_PUBLIC_URL = (os.getenv("VITE_PYTHON_API_URL") or "http://localhost:8000").rstrip("/")
PYTHON_BIND_HOST = os.getenv("PYTHON_BIND_HOST", "0.0.0.0")
PYTHON_BIND_PORT = _to_int(os.getenv("PYTHON_PORT"), 8000)
FRONTEND_URL = os.getenv("VITE_FRONTEND_URL")
ALLOWED_ORIGINS = [
    origin for origin in [
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://${FRONTEND_HOST}:${FRONTEND_PORT}"
    ] if origin and "${" not in origin
]
JOOBLE_API_KEY = (os.getenv("JOOBLE_API_KEY") or "").strip()
ADZUNA_APP_ID = (os.getenv("ADZUNA_APP_ID") or "").strip()
ADZUNA_APP_KEY = (os.getenv("ADZUNA_APP_KEY") or "").strip()


def _keywords_from_filename(filename: str) -> str:
    lower = (filename or "").lower()
    if "frontend" in lower:
        return "Frontend Developer"
    if "backend" in lower:
        return "Backend Developer"
    if "data" in lower:
        return "Data Analyst"
    return "Software Developer"


def _fetch_jooble_jobs(keywords: str, location: str, limit: int = 10) -> List[Dict[str, str]]:
    if not JOOBLE_API_KEY:
        return []
    url = f"https://jooble.org/api/{JOOBLE_API_KEY}"
    payload = {
        "keywords": keywords,
        "location": location,
    }

    try:
        response = requests.post(url, json=payload, timeout=20)
        response.raise_for_status()
        data = response.json()
        jobs = data.get("jobs", [])
        return [
            {
                "title": job.get("title") or "Untitled role",
                "company": job.get("company") or "Unknown company",
                "location": job.get("location") or location,
                "link": job.get("link"),
                "source": "Jooble",
            }
            for job in jobs[:limit]
        ]
    except (requests.RequestException, ValueError):
        return []


def _fetch_adzuna_jobs(keywords: str, location: str, limit: int = 10) -> List[Dict[str, str]]:
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        return []

    url = "https://api.adzuna.com/v1/api/jobs/in/search/1"
    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "what": keywords,
        "where": location,
        "results_per_page": limit,
    }

    try:
        response = requests.get(url, params=params, timeout=20)
        response.raise_for_status()
        data = response.json()
        jobs = data.get("results", [])
        return [
            {
                "title": job.get("title") or "Untitled role",
                "company": ((job.get("company") or {}).get("display_name") if isinstance(job.get("company"), dict) else None) or "Unknown company",
                "location": ((job.get("location") or {}).get("display_name") if isinstance(job.get("location"), dict) else None) or location,
                "link": job.get("redirect_url"),
                "source": "Adzuna",
            }
            for job in jobs[:limit]
        ]
    except (requests.RequestException, ValueError):
        return []


def _fallback_jobs(keywords: str, location: str, limit: int = 10) -> List[Dict[str, str]]:
    return [
        {
            "title": f"{keywords} Role {i + 1}",
            "company": "Unavailable Source",
            "location": location,
            "link": "",
            "source": "Fallback",
        }
        for i in range(limit)
    ]


# =============================================================================
# FASTAPI CONFIG
# =============================================================================

app = FastAPI(
    title="Resume Grammar Checker",
    version="2.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# MODELS
# =============================================================================

class TextAnalysisRequest(BaseModel):
    text: str


class JobDiscoveryRequest(BaseModel):
    skills: List[str] = []
    location: str = "India"


class GrammarIssue(BaseModel):
    error: str
    suggestion: str
    reason: str
    category: str
    rule_id: str
    offset: int
    context: str


class AnalysisResponse(BaseModel):
    success: bool
    total_issues: int
    has_errors: bool
    category_summary: Dict[str, int]
    issues: List[GrammarIssue]
    message: Optional[str] = None


# =============================================================================
# JOB DISCOVERY ENDPOINT
# =============================================================================

@app.post("/jobs")
async def get_jobs(request: JobDiscoveryRequest):
    skills = [skill.strip() for skill in request.skills if isinstance(skill, str) and skill.strip()]
    query = " ".join(dict.fromkeys(skills)) if skills else "Software Developer"
    location = request.location or "India"
    jobs = _fetch_jooble_jobs(query, location, limit=10)
    if not jobs:
        jobs = _fetch_adzuna_jobs(query, location, limit=10)
    if not jobs:
        jobs = _fallback_jobs(query, location, limit=10)
    return {"jobs": jobs}


@app.post("/jobs-from-resume")
async def get_jobs_from_resume(file: UploadFile = File(...)):
    keywords = _keywords_from_filename(file.filename or "")
    jobs = _fetch_jooble_jobs(keywords, "India", limit=10)
    if not jobs:
        jobs = _fetch_adzuna_jobs(keywords, "India", limit=10)
    if not jobs:
        jobs = _fallback_jobs(keywords, "India", limit=10)
    return {"jobs": jobs}


# =============================================================================
# SIMPLE FRONTEND
# =============================================================================

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    return """
    <html>
    <head><title>Grammar Checker</title></head>
    <body>
        <h2>Resume Grammar Checker</h2>
        <textarea id="text" rows="10" cols="80"></textarea><br><br>
        <button onclick="check()">Check Grammar</button>
        <pre id="output"></pre>

        <script>
        async function check() {
            const text = document.getElementById("text").value;

            const res = await fetch("/api/analyze/text", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({text})
            });

            const data = await res.json();
            document.getElementById("output").innerText =
                JSON.stringify(data, null, 2);
        }
        </script>
    </body>
    </html>
    """


# =============================================================================
# TEXT ANALYSIS ENDPOINT (DEBUG ENABLED)
# =============================================================================

@app.post("/api/analyze/text", response_model=AnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):

    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        print("\n================ DEBUG START ================")
        print("[DEBUG] RECEIVED TEXT:")
        print(request.text)
        print("=============================================")

        issues = grammar_analysis(request.text)

        print("[DEBUG] ISSUES FOUND:")
        print(issues)
        print("=============================================\n")

        return AnalysisResponse(
            success=True,
            total_issues=get_error_count(issues),
            has_errors=has_errors(issues),
            category_summary=get_errors_by_category(issues),
            issues=issues,
            message="Analysis completed successfully"
        )

    except Exception as e:
        print("[ERROR]", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# FILE ANALYSIS ENDPOINT (DEBUG ENABLED)
# =============================================================================

@app.post("/api/analyze/file", response_model=AnalysisResponse)
async def analyze_file(file: UploadFile = File(...)):

    temp_file = None

    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        if not file.filename.lower().endswith(('.txt', '.pdf', '.docx')):
            raise HTTPException(status_code=400, detail="Unsupported format")

        content = await file.read()

        with tempfile.NamedTemporaryFile(delete=False) as temp:
            temp.write(content)
            temp_file = temp.name

        resume_text = read_resume_file(temp_file)

        print("\n================ FILE DEBUG START ================")
        print("[DEBUG] EXTRACTED TEXT (first 500 chars):")
        print(resume_text[:500])
        print("==================================================")

        issues = grammar_analysis(resume_text)

        print("[DEBUG] ISSUES FOUND:")
        print(issues)
        print("==================================================\n")

        return AnalysisResponse(
            success=True,
            total_issues=get_error_count(issues),
            has_errors=has_errors(issues),
            category_summary=get_errors_by_category(issues),
            issues=issues,
            message="File analysis completed"
        )

    except Exception as e:
        print("[FILE ERROR]", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if temp_file and os.path.exists(temp_file):
            os.unlink(temp_file)


# =============================================================================
# STARTUP
# =============================================================================

@app.on_event("startup")
async def startup_event():
    print("\n======================================")
    print("Grammar Checker API Starting")
    print(f"URL: {PYTHON_PUBLIC_URL}")
    print("======================================\n")


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    uvicorn.run(app, host=PYTHON_BIND_HOST, port=PYTHON_BIND_PORT)
